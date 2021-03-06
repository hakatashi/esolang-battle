/*
 * Module dependencies.
 */
const fs = require('fs');
const path = require('path');
const util = require('util');
const bodyParser = require('body-parser');
const chalk = require('chalk');
const compression = require('compression');
const connectMongo = require('connect-mongo');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const errorHandler = require('errorhandler');
const express = require('express');
const flash = require('express-flash');
const Router = require('express-promise-router');
const session = require('express-session');
const {check} = require('express-validator');
const lusca = require('lusca');
const mongoose = require('mongoose');
const logger = require('morgan');
const multer = require('multer');
const sass = require('node-sass-middleware');
const passport = require('passport');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');



const MongoStore = connectMongo(session);

/*
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenvExpand(dotenv.config({path: '.env'}));

/*
 * Controllers (route handlers).
 */
const apiController = require('./controllers/api');
const contestController = require('./controllers/contest');
const homeController = require('./controllers/home');
const submissionController = require('./controllers/submission');
const userController = require('./controllers/user');

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

const upload = multer({
	limits: {
		fieldSize: 100 * 1024 * 1024,
	},
});

/*
 * Create Express server.
 */
const app = express();
const io = require('./lib/socket-io');

/*
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
// Use new parser, because of https://mongoosejs.com/docs/deprecations.html
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);

console.log(process.env.MONGODB_URI)
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
	throw new Error(
		`${chalk.red(
			'✗',
		)} MongoDB connection error. Please make sure MongoDB is running.`,
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
	}),
);
app.use(
	webpackDevMiddleware(compiler, {publicPath: webpackConfig.output.publicPath}),
);
if (process.env.NODE_ENV === 'development') {
	app.use(webpackHotMiddleware(compiler));
}
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(upload.fields([{name: 'file', maxCount: 1}]));
sess = {
   cookie: {
      samesite: 'strict'
   },
   resave: true,
   saveUninitialized: true,
   secret: process.env.SESSION_SECRET,
   store: new MongoStore({
      url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
      autoReconnect: true,
   }),
}
if (process.env.NODE_ENV !== 'development') {
   // to proxy, "trust proxy" must be enabled
   // send cookie on HTTPS only
   app.set('trust proxy', true); 
   sess.cookie.secure =  true;
}
const crypto = require('crypto');
app.use((req, res, next) => {
      Object.defineProperty(res.locals, 'nonce', {
            value: crypto.pseudoRandomBytes(36).toString('base64'),
            enumerable: true
      });
   console.log(res.locals.nonce);
   next();
});
// https://
app.use(session(sess));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.csrf());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.csp({
   policy: {
      'default-src': '\'self\'',
      //'script-src': "'self' 'unsafe-eval' https://www.googletagmanager.com https://maxcdn.bootstrapcdn.com https://cdnjs.cloudflare.com https://code.jquery.com",
      'script-src': "'self' https://www.googletagmanager.com https://maxcdn.bootstrapcdn.com https://cdnjs.cloudflare.com https://code.jquery.com",
      'style-src': "'self' https://fonts.googleapis.com",
      // THIS IS INSECURE https://security.stackexchange.com/questions/94993/is-including-the-data-scheme-in-your-content-security-policy-safe
      'img-src': "'self' https://gravatar.com data:",
      'connect-src': "'self'",
      'object-src': "'self'"
   },
   styleNonce: true,
}));
// TODO
// app.use(lusca.p3p("Privacy Policy"));
app.use(lusca.hsts({ maxAge: 31536000 }));
app.use(lusca.xssProtection(true));
app.use(lusca.nosniff());
app.use(lusca.referrerPolicy('same-origin'));
app.use(async (req, res, next) => {
	const hash = await util
		.promisify(fs.readFile)(path.resolve(__dirname, '.git/refs/heads/master'))
		.catch(() => Math.floor(Math.random() * 1e10));

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
const router = Router();
router.get('/', homeController.index);
router.get('/login', userController.getLogin);
router.get('/logout', userController.logout);
router.get(
	'/account',
	passportConfig.isAuthenticated,
	userController.getAccount,
);
router.get(
	'/contests/:contest',
	contestController.base,
	contestController.index,
);
router.get(
	'/contests/:contest/rule',
	contestController.base,
	contestController.rule,
);
router.get(
	'/contests/:contest/submissions',
	contestController.base,
	submissionController.getSubmissions,
);
router.get(
	'/contests/:contest/submissions/:submission',
	contestController.base,
	submissionController.getSubmission,
);
router.get(
	'/contests/:contest/submissions/:submission/raw',
	contestController.base,
	submissionController.getRawSubmission,
);
router.get(
	'/contests/:contest/admin',
	passportConfig.isAuthenticated,
	contestController.base,
	contestController.getAdmin,
);
router.get(
	'/contests/:contest/check',
	passportConfig.isAuthenticated,
	contestController.base,
	contestController.getCheck,
);

router.get('/submissions/:submission', submissionController.getOldSubmission);

router.get(
	'/api/contests/:contest/submission',
	passportConfig.isAuthenticated,
	apiController.contest,
	apiController.getSubmission,
);
router.post(
	'/api/contests/:contest/submission',
	check('language', 'Please Specify language').exists(),
	passportConfig.isAuthenticated,
	apiController.contest,
	apiController.postSubmission,
);
router.post(
	'/api/contests/:contest/execution',
	check('language', 'Please Specify language').exists(),
	passportConfig.isAuthenticated,
	apiController.contest,
	apiController.postExecution,
);
router.get(
	'/api/contests/:contest/languages',
	apiController.contest,
	apiController.getLanguages,
);

/*
 * OAuth authentication routes. (Sign in)
 */
router.get('/auth/twitter', passport.authenticate('twitter'));
router.get(
	'/auth/twitter/callback',
	passport.authenticate('twitter', {failureRedirect: '/login'}),
	(req, res) => {
		res.redirect(req.session.returnTo || '/');
	},
);

// GitHub authentication routes.
app.get('/auth/github', passport.authenticate('github', { scope: [''] }));
app.get('/auth/github/callback',
  passport.authenticate('github', { successRedirect: '/', failureRedirect: '/login' }),
  (req, res) => {
		res.redirect(req.session.returnTo || '/');
  });

app.use(router);

/*
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
	app.use(errorHandler());
}

/*
 * Start Express server.
 */
const server = app.listen(app.get('port'), () => {
	console.log(
		'%s App is running at http://localhost:%d in %s mode',
		chalk.green('✓'),
		app.get('port'),
		app.get('env'),
	);
	console.log('  Press CTRL-C to stop\n');
});

io.attach(server);

module.exports = app;
