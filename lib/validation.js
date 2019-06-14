const assert = require('assert');
const Language = require('../models/Language');
const Submission = require('../models/Submission');
const docker = require('../engines/docker');
const io = require('./socket-io');
const slack = require('./slack');
const contests = require('../contests');

const markError = (submission, error) => {
	console.error(error);
	submission.status = 'error';
	submission.error.name = error.name;
	submission.error.stack = error.stack;
	submission.save();
};

module.exports.validate = async ({submission, language, solution, contest}) => {
	try {
		assert({}.hasOwnProperty.call(contests, contest.id));
		const {generateInput, isValidAnswer} = contests[contest.id];

		submission.input = generateInput();
		const newSubmission = await submission.save();

		const info = await docker({
			id: language.slug,
			code: newSubmission.code,
			stdin: newSubmission.input,
			trace: true,
		});
		console.log('info:', info);

		if (typeof info !== 'object') {
			throw new Error('info is not object');
		}

		const {stdout, stderr, duration, error} = info;
		newSubmission.stdout = stdout;
		newSubmission.stderr = stderr;
		newSubmission.duration = duration;

		if (error) {
			await newSubmission.save();
			throw error;
		}

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

		if (populatedSubmission.status === 'success') {
			const bytesInfo = (() => {
				if (solution) {
					return `${
						[':heart:', ':blue_heart:', ':green_heart:', ':yellow_heart:', ':purple_heart:'][
							solution.user.getTeam(contest)
						]
					} **${solution.size} bytes** => ${
						[':heart:', ':blue_heart:', ':green_heart:', ':yellow_heart:', ':purple_heart:'][
							populatedSubmission.user.getTeam(contest)
						]
					} **${populatedSubmission.size} bytes**`;
				}

				return `:new: ${
					[':heart:', ':blue_heart:', ':green_heart:', ':yellow_heart:', ':purple_heart:'][
						populatedSubmission.user.getTeam(contest)
					]
				} **${populatedSubmission.size} bytes**`;
			})();

			slack.send({
				text: `**${populatedSubmission.user.name()}** won the language **${
					language.name
				}**!! (${bytesInfo}) Congrats!!!\nhttps://esolang.hakatashi.com/submissions/${
					populatedSubmission._id
				}`,
			});
		}
	} catch (error) {
		markError(submission, error);
	} finally {
		io.emit('update-submission', {_id: submission._id});
	}
};
