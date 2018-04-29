const Language = require('../models/Language');
const Submission = require('../models/Submission');
const Contest = require('../models/Contest');
const languages = require('../data/languages');
const validation = require('../lib/validation');
const {getLanguageMap} = require('../controllers/utils');
const assert = require('assert');
const concatStream = require('concat-stream');

/*
 * Middleware for all /api/contest/:contest routes
 */
module.exports.contest = async (req, res, next) => {
	const contest = await Contest.findOne({id: req.params.contest});

	if (!contest) {
		res.status(404).json({error: `Contest ${req.params.contest} not found`});
		return;
	}

	req.contest = contest;
	next();
};

/*
 * GET /api/contests/:contest/languages
 */
module.exports.getLanguages = async (req, res, next) => {
	try {
		const languageMap = await getLanguageMap({
			team: req.user && req.user.getTeam(req.contest),
			contest: req.contest,
		});
		res.json(languageMap);
	} catch (error) {
		return next(error);
	}
	return undefined;
};

/*
 * GET /api/contests/:contest/submission
 */
module.exports.getSubmission = (req, res, next) => {
	Submission.findOne({_id: req.query._id})
		.populate('user')
		.populate('language')
		.exec((error, submission) => {
			if (error) {
				return next(error);
			}

			if (submission === null) {
				return res.sendStatus(404);
			}

			if (!submission.user._id.equals(req.user._id)) {
				return res.sendStatus(403);
			}

			return res.json(submission);
		});
};

/*
 * POST /api/contest/:contest/submission
 */
module.exports.postSubmission = async (req, res) => {
	try {
		req.assert('language', 'Please Specify language').notEmpty();

		if (!req.contest.isOpen()) {
			throw new Error('Competition has closed');
		}

		let code = null;

		if (req.files && req.files.file && req.files.file.length === 1) {
			assert(req.files.file[0].size <= 10000, 'Code cannot be longer than 10,000 bytes');
			code = await new Promise((resolve) => {
				const stream = concatStream(resolve);
				req.files.file[0].stream.pipe(stream);
			});
		} else {
			code = Buffer.from(req.body.code.replace(/\r\n/g, '\n'), 'utf8');
		}

		assert(code.length >= 1, 'Code cannot be empty');
		assert(code.length <= 10000, 'Code cannot be longer than 10,000 bytes');

		const languageData = languages[req.contest.id].find(
			(l) => l && l.slug === req.body.language
		);

		if (languageData === undefined) {
			throw new Error(`Language ${req.body.language} doesn't exist`);
		}

		const latestSubmission = await Submission.findOne({user: req.user})
			.sort({createdAt: -1})
			.exec();
		if (
			latestSubmission !== null &&
			latestSubmission.createdAt > Date.now() - 5 * 1000
		) {
			throw new Error('Submission interval is too short');
		}

		const existingLanguage = await Language.findOne({slug: req.body.language})
			.populate({path: 'solution', populate: {path: 'user'}})
			.exec();

		const language = await new Promise((resolve, reject) => {
			// FIXME: Check if preceding cell is aleady taken
			if (existingLanguage !== null) {
				if (
					existingLanguage.solution &&
					existingLanguage.solution.size <= code.length
				) {
					reject(new Error('Shorter solution is already submitted'));
					return;
				}

				resolve(existingLanguage);
				return;
			}

			const newLanguage = new Language({
				solution: null,
				slug: languageData.slug,
			});

			newLanguage.save().then(() => {
				resolve(newLanguage);
			});
		});

		const submissionRecord = new Submission({
			language: language._id,
			user: req.user._id,
			code,
			size: code.length,
			status: 'pending',
			contest: req.contest,
		});

		const submission = await submissionRecord.save();

		validation.validate({
			submission,
			language: languageData,
			solution: language.solution,
		});

		res.json({_id: submission._id});
	} catch (error) {
		// eslint-disable-next-line callback-return
		res.status(400).json({error: error.message});
	}
};
