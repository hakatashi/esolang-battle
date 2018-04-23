const Submission = require('../models/Submission');
const User = require('../models/User');
const Language = require('../models/Language');
const moment = require('moment');
const Promise = require('bluebird');
const Hexdump = require('hexdump-stream');
const concatStream = require('concat-stream');
const isValidUTF8 = require('utf-8-validate');

/*
 * GET /submissions
 */
module.exports.getSubmissions = (req, res) => {
	Promise.try(() => {
		if (req.query.author) {
			return User.findOne({email: `${req.query.author}@twitter.com`}).then(
				(author) => ({author})
			);
		}

		return {};
	})
		.then(({author}) => {
			if (req.query.language) {
				return Language.findOne({slug: req.query.language}).then(
					(language) => ({author, language})
				);
			}

			return {author};
		})
		.then(({author, language}) => {
			const page = parseInt(req.query && req.query.page) || 0;
			const query = {};

			if (author) {
				query.user = author._id;
			}

			if (language) {
				query.language = language._id;
			}

			if (req.query.status) {
				query.status = req.query.status;
			}

			return Submission.find(query)
				.sort({_id: -1})
				.populate('user')
				.populate('language')
				.skip(500 * page)
				.limit(500)
				.exec();
		})
		.then((submissions) => {
			res.render('submissions', {
				title: 'Submissions',
				submissions,
				moment,
			});
		});
};

/*
 * GET /submissions/:submission
 */
module.exports.getSubmission = async (req, res) => {
	const _id = req.params.submission;

	const submission = await Submission.findOne({_id})
		.populate('user')
		.populate('language')
		.exec();

	if (submission === null) {
		res.sendStatus(404);
		return;
	}

	const {code, isHexdump} = await new Promise((resolve) => {
		// eslint-disable-next-line no-control-regex
		if (
			isValidUTF8(submission.code) &&
			!submission.code
				.toString()
				.match(/[\x00-\x08\x0b\x0c\x0e-\x1F\x7F\x80-\x9F]/)
		) {
			resolve({code: submission.code.toString(), isHexdump: false});
			return;
		}

		const hexdump = new Hexdump();
		const concatter = concatStream((dump) => {
			resolve({code: dump, isHexdump: true});
		});

		hexdump.pipe(concatter);
		hexdump.end(submission.code);
	});

	res.render('submission', {
		title: 'Submission',
		submission,
		code,
		isHexdump,
		selfTeam:
			req.user &&
			typeof req.user.team === 'number' &&
			req.user.team === submission.user.team,
	});
};
