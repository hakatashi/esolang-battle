const _ = require('lodash');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const User = require('../models/User');

const colors = [
	'#777777',
	'#b80000',
	'#1273de',
	'#fccb00',
	'#5300eb',
	'#006b76',
	'#db3e00',
	'#004dcf',
	'#008b02',
];

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});

passport.use(new GitHubStrategy({
   clientID: process.env.GITHUB_CLIENT_ID,
   clientSecret: process.env.GITHUB_CLIENT_SECRET,
   callbackURL: `${process.env.SERVER_ORIGIN}/auth/github/callback`,
   state: true
},
   async(accessToken, refreshToken, profile, cb) => {
      const count = User.count({});
      const existingUser = await User.findOne({email: `${profile.username}@github.com`});
      if (existingUser) {
         cb(null, existingUser);
         return;
      }

      const user = new User();
      // GitHub will not provide an email address.  Period.
      // But a person’s github username is guaranteed to be unique
      // so we can "fake" a github email address as follows:
      user.email = `${profile.username}@github.com`;
      user.color = colors[count % colors.length];
      user.github = profile.username;
      user.tokens.push({kind: 'github', accessToken, refreshToken});
      user.profile.name = profile.displayName;
      user.name = profile.username;
      console.log(profile);
      //user.profile.location = profile._json.location;
      user.profile.picture = profile.avatar_url;
      await user.save();
      return cb(null, user);
   }
));
// Sign in with Twitter.

passport.use(
	new TwitterStrategy(
		{
			consumerKey: process.env.TWITTER_KEY,
			consumerSecret: process.env.TWITTER_SECRET,
			callbackURL: `${process.env.SERVER_ORIGIN}/auth/twitter/callback`,
			passReqToCallback: true,
		},
		// eslint-disable-next-line max-params
		async (req, accessToken, tokenSecret, profile, done) => {
			try {
				if (req.user) {
					const existingUser = await User.findOne({email: `${profile.username}@twitter.com`});

					if (existingUser) {
						req.flash('errors', {
							msg:
								'There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account.',
						});
						done();
						return;
					}

					const user = await User.findById(req.user.id);

					user.twitter = profile.id;
					user.tokens.push({kind: 'twitter', accessToken, tokenSecret});
					user.profile.name = user.profile.name || profile.displayName;
					user.profile.location =
						user.profile.location || profile._json.location;
					user.profile.picture =
						user.profile.picture || profile._json.profile_image_url_https;

					await user.save();
					req.flash('info', {msg: 'Twitter account has been linked.'});
					done(null, user);
				} else {
					const existingUser = await User.findOne({twitter: profile.id});
					if (existingUser) {
						done(null, existingUser);
						return;
					}

					const count = User.count({});
					const user = new User();

					// Twitter will not provide an email address.  Period.
					// But a person’s twitter username is guaranteed to be unique
					// so we can "fake" a twitter email address as follows:
					user.email = `${profile.username}@twitter.com`;
					user.color = colors[count % colors.length];
					user.twitter = profile.id;
					user.tokens.push({kind: 'twitter', accessToken, tokenSecret});
					user.profile.name = profile.displayName;
					user.profile.location = profile._json.location;
					user.profile.picture = profile._json.profile_image_url_https;
					await user.save();

					done(null, user);
				}
			} catch (error) {
				if (error) {
					done(error);
				}
			}
		}
	)
);

/*
 * Login Required middleware.
 */
module.exports.isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		next();
		return;
	}
	res.redirect('/login');
};

/*
 * Authorization Required middleware.
 */
module.exports.isAuthorized = (req, res, next) => {
	const provider = req.path.split('/').slice(-1)[0];

	if (_.find(req.user.tokens, {kind: provider})) {
		next();
		return;
	}

	res.redirect(`/auth/${provider}`);
};
