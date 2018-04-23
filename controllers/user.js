/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
	if (req.user) {
		return res.redirect('/');
	}
	res.render('account/login', {
		title: 'Login',
	});
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
	req.logout();
	res.redirect('/');
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
	res.render('account/profile', {
		title: 'Account Management',
	});
};
