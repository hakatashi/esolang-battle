/*
 * GET /login
 * Login page.
 */
module.exports.getLogin = (req, res) => {
	if (req.user) {
		res.redirect('/');
		return;
	}
	res.render('account/login', {
		title: 'Login',
	});
};

/*
 * GET /logout
 * Log out.
 */
module.exports.logout = (req, res) => {
	req.logout();
	res.redirect('/');
};

/*
 * GET /account
 * Profile page.
 */
module.exports.getAccount = (req, res) => {
	res.render('account/profile', {
		title: 'Account Management',
	});
};
