const Language = require('../models/Language');
const Submission = require('../models/Submission');
const docker = require('../engines/docker');
const io = require('./socket-io');
const slack = require('./slack');
const {generateInput, isValidAnswer} = require('./secret.js');

const markError = (submission, error) => {
	console.error(error);
	submission.status = 'error';
	submission.error.name = error.name;
	submission.error.stack = error.stack;
	submission.save();
};

module.exports.validate = async ({submission, language, solution, contest}) => {
	try {
		submission.input = generateInput();
		const newSubmission = await submission.save();
		const params = {
			id: language.slug,
			code: newSubmission.code,
			stdin: newSubmission.input,
		};

		const info = await docker(params);
		console.log('info:', info);

		if (typeof info !== 'object') {
			throw new Error('info is not object');
		}

		const {stdout, stderr, duration} = info;
		newSubmission.stdout = stdout;
		newSubmission.stderr = stderr;
		newSubmission.duration = duration;

		if (isValidAnswer(newSubmission.input, stdout)) {
			newSubmission.status = 'success';

			Language.update(
				{slug: language.slug, contest},
				{$set: {solution: newSubmission._id}}
			).then(() => {
				io.emit('update-languages', {});
			});
		} else {
			newSubmission.status = 'failed';
		}

		const savedSubmission = await newSubmission.save();
		const populatedSubmission = await Submission.populate(savedSubmission, {
			path: 'user language',
		});
		io.emit('update-submission', {_id: populatedSubmission._id});

		if (populatedSubmission.status === 'success') {
			const bytesInfo = (() => {
				if (solution) {
					return `${
						[':heart:', ':blue_heart:', ':green_heart:'][
							solution.user.getTeam(contest)
						]
					} *${solution.size} bytes* => ${
						[':heart:', ':blue_heart:', ':green_heart:'][
							populatedSubmission.user.getTeam(contest)
						]
					} *${populatedSubmission.size} bytes*`;
				}

				return `:new: ${
					[':heart:', ':blue_heart:', ':green_heart:'][
						populatedSubmission.user.getTeam(contest)
					]
				} *${populatedSubmission.size} bytes*`;
			})();

			slack.send({
				text: `*${populatedSubmission.user.name()}* won the language *${
					language.name
				}*!! (${bytesInfo}) Congrats!!! <https://esolang.hakatashi.com/submissions/${
					populatedSubmission._id
				}|[Details]>`,
			});
		}
	} catch (error) {
		markError(submission, error);
	}
};
