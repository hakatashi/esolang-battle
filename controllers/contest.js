const classnames = require('classnames');
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
	console.log(languageMap);
	res.render('contest', {
		contest: req.contest,
		languageMap,
		classnames,
	});
};
