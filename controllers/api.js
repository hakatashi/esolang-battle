const assert = require('assert');
const crypto = require('crypto');
const concatStream = require('concat-stream');
const {getLanguageMap, getCodeLimit} = require('../controllers/utils');
const languages = require('../data/languages');
const docker = require('../engines/docker');
const validation = require('../lib/validation');
const Contest = require('../models/Contest');
const Execution = require('../models/Execution');
const Language = require('../models/Language');
const Submission = require('../models/Submission');
const {Mutex} = require('async-mutex');

const executionMutex = new Mutex();
const apiKey = process.env.API_KEY || crypto.randomBytes(64).toString('hex');

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
	// FIXME: visibility test
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
 * POST /api/execution
 */
module.exports.postExecution = async (req, res) => {
	try {
		assert(req.body.token === apiKey, 'Please provide valid token');

		const code = Buffer.from(req.body.code ?? '', 'base64');

		assert(code.length >= 1, 'Code cannot be empty');
		assert(
			code.length <= getCodeLimit(req.body.language),
			'Code cannot be longer than 10,000 bytes',
		);

		const input = req.body.input ?? '';

		assert(input.length <= 10000, 'Input cannot be longer than 10,000 bytes');

		const info = await executionMutex.runExclusive(() => docker({
			id: req.body.language,
			code,
			stdin: input,
			trace: true,
			imageId: req.body.imageId,
		}));

		if (typeof info !== 'object') {
			throw new Error('info is not object');
		}

		const {stdout, stderr, duration, error, trace} = info;

		if (error) {
			throw error;
		}

		const executionRecord = new Execution({
			language: null,
			user: null,
			code,
			input,
			stdout: stdout.toString(),
			stderr: stderr.toString(),
			duration,
		});

		await executionRecord.save();

		res.json({
			stdout: stdout.toString(),
			stderr: stderr.toString(),
			duration,
			trace: trace.toString('base64'),
		});
	} catch (error) {
		// eslint-disable-next-line callback-return
		res.status(400).json({error: error.message});
	}
};

/*
 * POST /api/contest/:contest/execution
 */
module.exports.postContestExecution = async (req, res) => {
	try {
		if (!req.contest.isOpen()) {
			throw new Error('Competition has closed');
		}

		let code = null;

		if (req.files && req.files.file && req.files.file.length === 1) {
			assert(
				req.files.file[0].size < getCodeLimit(req.body.language),
				'Code cannot be longer than 10,000 bytes',
			);
			code = await new Promise((resolve) => {
				const stream = concatStream(resolve);
				req.files.file[0].stream.pipe(stream);
			});
		} else {
			code = Buffer.from(req.body.code.replace(/\r\n/g, '\n'), 'utf8');
		}

		assert(code.length >= 1, 'Code cannot be empty');
		assert(
			code.length <= getCodeLimit(req.body.language),
			'Code cannot be longer than 10,000 bytes',
		);

		const input = req.body.input.replace(/\r\n/g, '\n') || '';

		assert(input.length <= 10000, 'Input cannot be longer than 10,000 bytes');

		const languageData = languages[req.contest.id].find(
			(l) => l && l.slug === req.body.language,
		);

		if (languageData === undefined) {
			throw new Error(`Language ${req.body.language} doesn't exist`);
		}

		const latestExecution = await Execution.findOne({user: req.user})
			.sort({createdAt: -1})
			.exec();
		if (
			latestExecution !== null &&
			latestExecution.createdAt > Date.now() - 5 * 1000
		) {
			throw new Error('Execution interval is too short');
		}

		const existingLanguage = await Language.findOne({
			slug: req.body.language,
			contest: req.contest,
		}).exec();

		const language = await new Promise((resolve) => {
			if (existingLanguage !== null) {
				resolve(existingLanguage);
				return;
			}

			const newLanguage = new Language({
				solution: null,
				slug: languageData.slug,
				contest: req.contest,
			});

			newLanguage.save().then(() => {
				resolve(newLanguage);
			});
		});

		const info = await executionMutex.runExclusive(() => docker({
			id: language.slug,
			code,
			stdin: input,
			trace: false,
		}));

		if (typeof info !== 'object') {
			throw new Error('info is not object');
		}

		const {stdout, stderr, duration, error} = info;

		if (error) {
			throw error;
		}

		const executionRecord = new Execution({
			language,
			user: req.user,
			code,
			input,
			stdout: stdout.toString(),
			stderr: stderr.toString(),
			duration,
		});

		await executionRecord.save();

		res.json({
			stdout: stdout.toString(),
			stderr: stderr.toString(),
			duration,
		});
	} catch (error) {
		// eslint-disable-next-line callback-return
		res.status(400).json({error: error.message});
	}
};

/*
 * POST /api/contest/:contest/submission
 */
module.exports.postSubmission = async (req, res) => {
	try {
		if (!req.contest.isOpen()) {
			throw new Error('Competition has closed');
		}

		let code = null;

		if (req.files && req.files.file && req.files.file.length === 1) {
			assert(
				req.files.file[0].size < getCodeLimit(req.body.language),
				'Code cannot be longer than 10,000 bytes',
			);
			code = await new Promise((resolve) => {
				const stream = concatStream(resolve);
				req.files.file[0].stream.pipe(stream);
			});
		} else {
			code = Buffer.from(req.body.code.replace(/\r\n/g, '\n'), 'utf8');
		}

		assert(code.length >= 1, 'Code cannot be empty');
		assert(
			code.length <= getCodeLimit(req.body.language),
			'Code cannot be longer than 10,000 bytes',
		);

		const languageData = languages[req.contest.id].find(
			(l) => l && l.slug === req.body.language,
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

		const existingLanguage = await Language.findOne({
			slug: req.body.language,
			contest: req.contest,
		})
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
				contest: req.contest,
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
			contest: req.contest,
		});

		res.json({_id: submission._id});
	} catch (error) {
		// eslint-disable-next-line callback-return
		res.status(400).json({error: error.message});
	}
};
