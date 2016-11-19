const _ = require('lodash');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

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

// Sign in with Twitter.

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_KEY,
  consumerSecret: process.env.TWITTER_SECRET,
  callbackURL: '/auth/twitter/callback',
  passReqToCallback: true
}, (req, accessToken, tokenSecret, profile, done) => {
  if (req.user) {
    User.findOne({ twitter: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
        done(err);
      } else {
        User.findById(req.user.id, (err, user) => {
          if (err) { return done(err); }
          user.twitter = profile.id;
          user.tokens.push({ kind: 'twitter', accessToken, tokenSecret });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.location = user.profile.location || profile._json.location;
          user.profile.picture = user.profile.picture || profile._json.profile_image_url_https;
          user.save((err) => {
            if (err) { return done(err); }
            req.flash('info', { msg: 'Twitter account has been linked.' });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({ twitter: profile.id }, (err, existingUser) => {
      if (err) { return done(err); }
      if (existingUser) {
        return done(null, existingUser);
      }

      User.count({}, (error, count) => {
        if (error) {
          return done(error);
        }

        const user = new User();

        // Twitter will not provide an email address.  Period.
        // But a person’s twitter username is guaranteed to be unique
        // so we can "fake" a twitter email address as follows:
        user.email = `${profile.username}@twitter.com`;
        user.color = colors[count % colors.length];
        user.twitter = profile.id;
        user.tokens.push({ kind: 'twitter', accessToken, tokenSecret });
        user.profile.name = profile.displayName;
        user.profile.location = profile._json.location;
        user.profile.picture = profile._json.profile_image_url_https;
        user.save((err) => {
          done(err, user);
        });
      });
    });
  }
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
