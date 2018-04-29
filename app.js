/*
 * Module dependencies.
 */
const fs = require('fs');
const path = require('path');
const util = require('util');
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const sass = require('node-sass-middleware');
const multer = require('multer');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

/*
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({path: '.env'});

/*
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const submissionController = require('./controllers/submission');
const apiController = require('./controllers/api');
const contestController = require('./controllers/contest');

/*
 * Build-up Webpack compiler
 */
const webpackConfigGenerator = require('./webpack.config.js');
const webpackConfig = webpackConfigGenerator({}, {mode: process.env.NODE_ENV});
const compiler = webpack(webpackConfig);

/*
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

const upload = multer();

/*
 * Create Express server.
 */
const app = express();
const io = require('./lib/socket-io');

/*
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
	throw new Error(
		`${chalk.red(
			'✗'
		)} MongoDB connection error. Please make sure MongoDB is running.`
	);
});

/*
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(compression());
app.use(
	sass({
		src: path.join(__dirname, 'public'),
		dest: path.join(__dirname, 'public'),
	})
);
app.use(
	webpackDevMiddleware(compiler, {publicPath: webpackConfig.output.publicPath})
);
if (process.env.NODE_ENV === 'development') {
	app.use(webpackHotMiddleware(compiler));
}
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(upload.fields([{name: 'file', maxCount: 1}]));
app.use(expressValidator());
app.use(
	session({
		resave: true,
		saveUninitialized: true,
		secret: process.env.SESSION_SECRET,
		store: new MongoStore({
			url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
			autoReconnect: true,
		}),
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
	lusca.csrf()(req, res, next);
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(async (req, res, next) => {
	const hash = await util.promisify(fs.readFile)(
		path.resolve(__dirname, '.git/refs/heads/master')
	);

	res.locals.user = req.user;
	res.locals.hash = hash.toString().trim();
	res.locals.env = process.env.NODE_ENV;

	next();
});
app.use((req, res, next) => {
	// After successful login, redirect back to the intended page
	if (
		!req.user &&
		req.path !== '/login' &&
		req.path !== '/signup' &&
		!req.path.match(/^\/auth/) &&
		!req.path.match(/\./)
	) {
		req.session.returnTo = req.path;
	} else if (req.user && req.path === '/account') {
		req.session.returnTo = req.path;
	}
	next();
});
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 31557600000}));

/*
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.get('/logout', userController.logout);
app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
app.get('/contests/:contest', contestController.base, contestController.index);
app.get(
	'/contests/:contest/rule',
	contestController.base,
	contestController.rule
);
app.get(
	'/contests/:contest/submissions',
	contestController.base,
	submissionController.getSubmissions
);
app.get(
	'/contests/:contest/submissions/:submission',
	contestController.base,
	submissionController.getSubmission
);
app.get(
	'/contests/:contest/submissions/:submission/raw',
	contestController.base,
	submissionController.getRawSubmission
);

app.get('/submissions/:submission', submissionController.getOldSubmission);

app.get(
	'/api/contests/:contest/submission',
	passportConfig.isAuthenticated,
	apiController.contest,
	apiController.getSubmission
);
app.post(
	'/api/contests/:contest/submission',
	passportConfig.isAuthenticated,
	apiController.contest,
	apiController.postSubmission
);
app.post(
	'/api/contests/:contest/execution',
	passportConfig.isAuthenticated,
	apiController.contest,
	apiController.postExecution
);
app.get(
	'/api/contests/:contest/languages',
	apiController.contest,
	apiController.getLanguages
);

/*
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get(
	'/auth/twitter/callback',
	passport.authenticate('twitter', {failureRedirect: '/login'}),
	(req, res) => {
		res.redirect(req.session.returnTo || '/');
	}
);

/*
 * Error Handler.
 */
app.use(errorHandler());

/*
 * Start Express server.
 */
const server = app.listen(app.get('port'), () => {
	console.log(
		'%s App is running at http://localhost:%d in %s mode',
		chalk.green('✓'),
		app.get('port'),
		app.get('env')
	);
	console.log('  Press CTRL-C to stop\n');
});

io.attach(server);

module.exports = app;
