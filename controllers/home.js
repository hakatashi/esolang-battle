const classnames = require('classnames');
const {getLanguageMap} = require('../controllers/utils');

/*
 * GET /
 * Home page.
 */
module.exports.index = async (req, res) => {
	const languageMap = await getLanguageMap();
	res.render('home', {
		title: 'Home',
		languageMap,
		classnames,
	});
};
