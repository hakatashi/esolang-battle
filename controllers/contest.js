const classnames = require('classnames');
const Contest = require('../models/Contest');
const {getLanguageMap} = require('../controllers/utils');

/*
 * GET /
 * Home page.
 */
module.exports.index = async (req, res) => {
	const contest = await Contest.findOne({index: parseInt(req.params.contest)});

	if (!contest) {
		res.sendStatus(404);
		return;
	}

	const languageMap = await getLanguageMap();
	res.render('contest', {
		title: `第${contest.index}回 コードゴルフ大会`,
		languageMap,
		classnames,
	});
};
