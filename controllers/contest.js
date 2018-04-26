const classnames = require('classnames');
const MarkdownIt = require('markdown-it');
const Contest = require('../models/Contest');
const {getLanguageMap} = require('../controllers/utils');

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
		contest: req.contest,
		languageMap,
		classnames,
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
