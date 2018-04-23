const languages = require('../languages');
const classnames = require('classnames');

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
	res.render('home', {
		title: 'Home',
		languages,
		classnames,
	});
};
