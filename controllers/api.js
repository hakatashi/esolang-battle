const Language = require('../models/Language');
const Submission = require('../models/Submission');
const languages = require('../languages');
const validation = require('../lib/validation');
const assert = require('assert');

const getPrecedingIndices = (index) => {
	const x = index % 15;
	const y = Math.floor(index / 15);
	const margin = y < 4 ? 3 - y : y - 4;
	const direction = (x + y) % 2 ? 'up' : 'down';

	const precedingCells = [];

	if (x - 1 >= margin) {
		precedingCells.push(y * 15 + (x - 1));
	}

	if (x + 1 <= 14 - margin) {
		precedingCells.push(y * 15 + (x + 1));
	}

	if (direction === 'down' && y - 1 >= 0) {
		precedingCells.push((y - 1) * 15 + x);
	}

	if (direction === 'up' && y + 1 <= 7) {
		precedingCells.push((y + 1) * 15 + x);
	}

	return precedingCells;
};

/*
 * GET /api/languages
 */
module.exports.getLanguages = (req, res, next) => {
	Language.find()
		.populate({
			path: 'solution',
			populate: {path: 'user'},
		})
		.exec((error, languageRecords) => {
			if (error) {
				return next(error);
			}

			const team = req.user && req.user.team;

			const languageCells = languages.map((language) => {
				if (language && language.type === 'language') {
					return Object.assign({}, language, {
						record: languageRecords.find(
							(languageRecord) => languageRecord.slug === language.slug
						),
					});
				}

				return Object.assign({}, language);
			});

			return res.json(
				languageCells.map((cell, index) => {
					if (cell.type === 'language') {
						if (new Date() >= new Date('2017-08-26T15:00:00.000Z')) {
							if (cell.record && cell.record.solution) {
								return {
									type: 'language',
									solved: true,
									team: cell.record.solution.user.team,
									solution: {
										_id: cell.record.solution._id,
										size: cell.record.solution.size,
										user: cell.record.solution.user.name(),
									},
									slug: cell.slug,
									name: cell.name,
									available: false,
								};
							}

							return {
								type: 'language',
								solved: false,
								slug: cell.slug,
								name: cell.name,
								available: false,
							};
						}

						const precedingCells = getPrecedingIndices(index).map(
							(i) => languageCells[i]
						);

						const available =
							typeof team === 'number' &&
							(cell.team === team ||
								(cell.record &&
									cell.record.solution &&
									cell.record.solution.user.team === team) ||
								precedingCells.some(
									(c) => c.team === team ||
										(c.record &&
											c.record.solution &&
											c.record.solution.user.team === team)
								));

						if (cell.record && cell.record.solution) {
							return {
								type: 'language',
								solved: true,
								team: cell.record.solution.user.team,
								solution: {
									_id: cell.record.solution._id,
									size: cell.record.solution.size,
									user: cell.record.solution.user.name(),
								},
								slug: cell.slug,
								name: cell.name,
								available,
							};
						}

						if (
							precedingCells.some(
								(c) => c.type === 'base' ||
									(c.type === 'language' && c.record && c.record.solution)
							)
						) {
							return {
								type: 'language',
								solved: false,
								slug: cell.slug,
								name: cell.name,
								available,
							};
						}

						return {
							type: 'unknown',
						};
					} else if (cell.type === 'base') {
						return {
							type: 'base',
							team: cell.team,
						};
					}

					return {
						type: 'unknown',
					};
				})
			);
		});
};

/*
 * GET /api/submission
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
 * POST /api/submission
 */
module.exports.postSubmission = async (req, res, next) => {
	req.assert('language', 'Please Specify language').notEmpty();

	if (new Date() >= new Date('2017-08-26T15:00:00.000Z')) {
		res.status(400).json({error: 'Competition has closed'});
		return;
	}

	let code = null;

	if (req.files && req.files.file && req.files.file.length === 1) {
		code = req.files.file[0].buffer;
	} else {
		req
			.assert('code', 'Code cannot be empty or longer than 10000 bytes')
			.len(1, 10000);
		code = Buffer.from(req.body.code.replace(/\r\n/g, '\n'), 'utf8');
	}

	assert(code.length >= 1 && code.length <= 10000);

	const languageData = languages.find((l) => l && l.slug === req.body.language);

	if (languageData === undefined) {
		next(new Error(`Language ${req.body.language} doesn't exist`));
		return;
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
		// TODO: Check if preceding cell is aleady taken
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
	});

	const submission = await submissionRecord.save();

	validation.validate(req.user, submission, languageData, language.solution);

	res.json(submission);
};
