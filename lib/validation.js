const Language = require('../models/Language');
const Submission = require('../models/Submission');
const docker = require('../engines/docker');
const io = require('./socket-io');
const slack = require('./slack');
const { generateInput, isValidAnswer } = require('./secret.js');

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
      id: language.slug,
      code: newSubmission.code,
      stdin: newSubmission.input,
    };

    docker(params).then(({ stdout, stderr }) => {
      newSubmission.stdout = stdout;
      newSubmission.stderr = stderr;

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
              text: `*${submission.user.name()}* won the language *${language.name}* (size: ${submission.size})!! Congrats!!! <https://esolang.hakatashi.com/|[Scoreboard]>`,
            });
          }
        });
      });
    }).catch((error) => {
      markError(submission, error);
    });
  });
};
