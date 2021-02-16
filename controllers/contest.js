const qs = require('querystring');
const classnames = require('classnames');
const MarkdownIt = require('markdown-it');
const {getLanguageMap} = require('../controllers/utils');
const Contest = require('../models/Contest');
const User = require('../models/User');

/*
 * Middleware for all /contest/:contest routes
 */
module.exports.base = async (req, res, next) => {
	const contest = await Contest.findOne({id: req.params.contest});

	if (!contest) {
		res.sendStatus(404);
		return;
	}

	req.contest = contest;
	next();
};

/*
 * GET /
 * Home page.
 */
module.exports.index = async (req, res) => {
	const languageMap = await getLanguageMap({contest: req.contest});
	res.render('contest', {
		title: '',
		contest: req.contest,
		languageMap,
		classnames,
		hideFooter: true,
	});
};

module.exports.rule = (req, res) => {
	const markdown = new MarkdownIt();
	res.render('rule', {
		contest: req.contest,
		title: 'Rule',
		description: {
			ja: markdown.render(req.contest.description.ja),
			en: markdown.render(req.contest.description.en),
		},
	});
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
		teams: ['Red', 'Blue', 'Green', 'Orange', 'Purple'],
		colors: ['#ef2011', '#0e30ec', '#167516', '#f57f17', '#6a1b9a'],
		qs,
	});
};

/*
 * GET /contest/:contest/check
 */
module.exports.getCheck = async (req, res) => {
	if (!req.contest.isOpen()) {
		res.redirect(`/contests/${req.contest.id}`);
		return;
	}

	const languages = await getLanguageMap({contest: req.contest});
	const availableLanguages = languages
		.filter(({type}) => type === 'language')
		.sort(({name: nameA}, {name: nameB}) => nameA.localeCompare(nameB));

	res.render('check', {
		title: 'Check',
		contest: req.contest,
		availableLanguages,
	});
};
