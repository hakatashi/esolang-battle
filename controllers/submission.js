const Submission = require('../models/Submission');
const User = require('../models/User');
const Language = require('../models/Language');
const {getLanguageMap} = require('../controllers/utils');
const Hexdump = require('hexdump-stream');
const concatStream = require('concat-stream');
const isValidUTF8 = require('utf-8-validate');
const qs = require('querystring');

/*
 * GET /submissions
 */
module.exports.getSubmissions = async (req, res) => {
	const query = {
		contest: req.contest,
	};

	if (req.query.author) {
		const author = await User.findOne({
			email: `${req.query.author}@twitter.com`,
		});
		if (author) {
			query.user = author._id;
		}
	}

	if (req.query.language) {
		const language = await Language.findOne({
			slug: req.query.language,
			contest: req.contest,
		});
		if (language) {
			query.language = language._id;
		}
	}

	const page = parseInt(req.query && req.query.page) || 0;

	if (req.query.status) {
		query.status = req.query.status;
	}

	const submissions = await Submission.find(query)
		.sort({_id: -1})
		.populate('user')
		.populate('language')
		.skip(500 * page)
		.limit(500)
		.exec();

	const totalSubmissions = await Submission.find(query)
		.count()
		.exec();

	res.render('submissions', {
		contest: req.contest,
		title: 'Submissions',
		submissions,
		page,
		query: req.query || {},
		totalPages: Math.ceil(totalSubmissions / 500),
		encode: qs.encode,
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
		.populate('contest')
		.exec();

	if (submission === null) {
		res.sendStatus(404);
		return;
	}

	if (submission.contest.id !== req.params.contest) {
		res.redirect(
			`/contests/${submission.contest.id}/submissions/${submission._id}`
		);
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
		contest: req.contest,
		title: `Submission by ${submission.user.name()} (${
			submission.language.slug
		}, ${submission.size} bytes)`,
		submission,
		code,
		isHexdump,
		selfTeam:
			req.user &&
			req.user.getTeam(req.contest) === submission.user.getTeam(req.contest),
	});
};

module.exports.getOldSubmission = async (req, res) => {
	const _id = req.params.submission;

	const submission = await Submission.findOne({_id})
		.populate('contest')
		.exec();

	if (submission === null) {
		res.sendStatus(404);
		return;
	}

	res.redirect(
		`/contests/${submission.contest.id}/submissions/${submission._id}`
	);
};

/*
 * GET /contest/:contest/submissions/:submission/raw
 */
module.exports.getRawSubmission = async (req, res) => {
	const _id = req.params.submission;

	const submission = await Submission.findOne({_id});

	if (submission === null) {
		res.sendStatus(404);
		return;
	}

	res.set({
		'Content-Type': 'text/plain',
		'Content-Disposition': 'attachment',
	});

	res.send(submission.code);
};

/*
 * GET /contest/:contest/admin
 */
module.exports.getAdmin = async (req, res) => {
	if (!req.user.admin) {
		res.sendStatus(403);
		return;
	}

	if (req.query.user && req.query.team) {
		const user = await User.findOne({_id: req.query.user});
		user.setTeam(req.contest, req.query.team);
		await user.save();
		res.redirect(`/contests/${req.params.contest}/admin`);
		return;
	}

	const users = await User.find();

	res.render('admin', {
		contest: req.contest,
		users,
		teams: ['Red', 'Blue', 'Green'],
		colors: ['#ef2011', '#0e30ec', '#167516'],
		qs,
	});
};

/*
 * GET /contest/:contest/check
 */
module.exports.getCheck = async (req, res) => {
	const languages = await getLanguageMap({contest: req.contest});
	const availableLanguages = languages.filter(({type}) => type === 'language').sort(({name: nameA}, {name: nameB}) => nameA.localeCompare(nameB));

	res.render('check', {
		contest: req.contest,
		availableLanguages,
	});
};
