const BigNumber = require('bignumber.js');
const Language = require('../models/Language');
const Submission = require('../models/Submission');
const ideone = require('../engines/ideone');
const tryit = require('../engines/tryit');
const assert = require('assert');
const io = require('./socket-io');
const slack = require('./slack');

BigNumber.config({ EXPONENTIAL_AT: 1e+9 });

const generateInput = () => Array.from({ length: 100 }, () => Math.random() < 0.5 ? 0 : 1).join('');

const isValidAnswer = (input, output) => {
  assert(input.match(/^[01]{100}$/));

  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  const big = new BigNumber(input, 2);
  const decimal = big.toString();

  // Trim
  output = output.trim();

  // Remove leading zeroes
  output = output.replace(/^0+/, '');

  return output === decimal;
};

const markError = (submission, error) => {
  console.error(error);
  submission.status = 'error';
  submission.save();
};

module.exports.validate = (user, submission, language) => {
  submission.input = generateInput();
  submission.save((error, newSubmission) => {
    if (error) {
      return markError(submission, error);
    }

    const params = {
      id: language.id,
      code: newSubmission.code,
      stdin: newSubmission.input,
    };

    const runner = (() => {
      if (language.engine === 'tryit') {
        return tryit(params);
      } else if (language.engine === 'ideone') {
        return ideone(params);
      }

      return Promise.reject(new Error('Unknown engine'));
    })();

    runner.then(({ href, stdout }) => {
      newSubmission.url = href;
      newSubmission.output = stdout;

      if (isValidAnswer(newSubmission.input, stdout)) {
        newSubmission.status = 'success';

        Language.update({ slug: language.slug }, { $set: { solution: newSubmission._id } }, (error) => {
          if (error) {
            return markError(newSubmission, error);
          }

          io.emit('update-languages', {});
        });
      } else {
        newSubmission.status = 'failed';
      }

      newSubmission.save((error, submission) => {
        if (error) {
          return markError(submission, error);
        }

        Submission.populate(submission, { path: 'user language' }, (error, submission) => {
          io.emit('update-submission', { _id: submission._id, });

          if (submission.status === 'success') {
            slack.send({
              text: `*${submission.user.name()}* won the language *${language.name}*!! Congrats!!! <https://esolang.hakatashi.com/|[Scoreboard]>`,
            });
          }
        });
      });
    }).catch((error) => {
      markError(submission, error);
    });
  });
};
