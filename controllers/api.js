const async = require('async');
const request = require('request');
const cheerio = require('cheerio');
const graph = require('fbgraph');
const LastFmNode = require('lastfm').LastFmNode;
const tumblr = require('tumblr.js');
const GitHub = require('github');
const Twit = require('twit');
const stripe = require('stripe')(process.env.STRIPE_SKEY);
const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const Linkedin = require('node-linkedin')(process.env.LINKEDIN_ID, process.env.LINKEDIN_SECRET, process.env.LINKEDIN_CALLBACK_URL);
const clockwork = require('clockwork')({ key: process.env.CLOCKWORK_KEY });
const paypal = require('paypal-rest-sdk');
const lob = require('lob')(process.env.LOB_KEY);
const ig = require('instagram-node').instagram();
const foursquare = require('node-foursquare')({
  secrets: {
    clientId: process.env.FOURSQUARE_ID,
    clientSecret: process.env.FOURSQUARE_SECRET,
    redirectUrl: process.env.FOURSQUARE_REDIRECT_URL
  }
});

const Language = require('../models/Language');
const Submission = require('../models/Submission');
const languages = require('../languages');
const validation = require('../lib/validation');
const assert = require('assert');

const getPrecedingIndices = (index) => {
  const x = index % 15;
  const y = Math.floor(index / 15);
  const margin = (y < 4) ? (3 - y) : (y - 4);
  const direction = (x + y) % 2 ? 'up' : 'down';

  const precedingCells = [];

  if (x - 1 >= margin) {
    precedingCells.push((y * 15) + (x - 1));
  }

  if (x + 1 <= 14 - margin) {
    precedingCells.push((y * 15) + (x + 1));
  }

  if (direction === 'down' && y - 1 >= 0) {
    precedingCells.push(((y - 1) * 15) + x);
  }

  if (direction === 'up' && y + 1 <= 7) {
    precedingCells.push(((y + 1) * 15) + x);
  }

  return precedingCells;
};

/**
 * GET /api/languages
 */
exports.getLanguages = (req, res, next) => {
  Language.find().populate({
    path: 'solution',
    populate: { path: 'user' },
  }).exec((error, languageRecords) => {
    if (error) {
      return next(error);
    }

    const team = req.user && req.user.team;

    const languageMap = languages.map((language) => {
      if (language && language.type === 'language') {
        return Object.assign({}, language, {
          record: languageRecords.find(languageRecord => languageRecord.slug === language.slug),
        });
      }

      return Object.assign({}, language);
    });

    return res.json(languageMap.map((cell, index) => {
      if (cell.type === 'language') {
        if (new Date() >= new Date('2017-08-26T15:00:00.000Z')) {
          if (cell.record && cell.record.solution) {
            return {
              type: 'language',
              solved: true,
              team: cell.record.solution.user.team,
              solution: {
                _id: cell.record.solution._id,
                size: cell.record.solution.size,
                user: cell.record.solution.user.name(),
              },
              slug: cell.slug,
              name: cell.name,
              available: false,
            };
          }

          return {
            type: 'language',
            solved: false,
            slug: cell.slug,
            name: cell.name,
            available: false,
          };
        }

        const precedingCells = getPrecedingIndices(index).map(i => languageMap[i]);

        const available = typeof team === 'number' && (
          (
            cell.team === team ||
            (cell.record && cell.record.solution && cell.record.solution.user.team === team)
          ) || (
            precedingCells.some(cell => (
              cell.team === team ||
              (cell.record && cell.record.solution && cell.record.solution.user.team === team)
            ))
          )
        );

        if (cell.record && cell.record.solution) {
          return {
            type: 'language',
            solved: true,
            team: cell.record.solution.user.team,
            solution: {
              _id: cell.record.solution._id,
              size: cell.record.solution.size,
              user: cell.record.solution.user.name(),
            },
            slug: cell.slug,
            name: cell.name,
            available,
          };
        }

        if (precedingCells.some(cell => cell.type === 'base' || (cell.type === 'language' && cell.record && cell.record.solution))) {
          return {
            type: 'language',
            solved: false,
            slug: cell.slug,
            name: cell.name,
            available,
          };
        }

        return {
          type: 'unknown',
        };
      } else if (cell.type === 'base') {
        return {
          type: 'base',
          team: cell.team,
        };
      }

      return {
        type: 'unknown',
      };
    }));
  });
};

/**
 * GET /api/submission
 */
exports.getSubmission = (req, res, next) => {
  Submission.findOne({ _id: req.query._id }).populate('user').populate('language').exec((error, submission) => {
    if (error) {
      return next(error);
    }

    if (submission === null) {
      return res.sendStatus(404);
    }

    if (!submission.user._id.equals(req.user._id)) {
      return res.sendStatus(403);
    }

    return res.json(submission);
  });
};

/**
 * POST /api/submission
 */
exports.postSubmission = (req, res, next) => {
  req.assert('language', 'Please Specify language').notEmpty();

  if (new Date() >= new Date('2017-08-26T15:00:00.000Z')) {
    return res.status(400).json({
      error: 'Competition has closed',
    });
  }

  let code;

  if (req.files && req.files.file && req.files.file.length === 1) {
    code = req.files.file[0].buffer;
  } else {
    req.assert('code', 'Code cannot be empty or longer than 10000 bytes').len(1, 10000);
    code = Buffer.from(req.body.code.replace(/\r\n/g, '\n'), 'utf8');
  }

  assert(code.length >= 1 && code.length <= 10000);

  const languageData = languages.find(l => l && l.slug === req.body.language);

  if (languageData === undefined) {
    return next(new Error(`Language ${req.body.language} doesn't exist`));
  }

  Submission.findOne({ user: req.user }).sort({ createdAt: -1 }).exec()
    .then((latestSubmission) => {
      if (latestSubmission !== null && latestSubmission.createdAt > Date.now() - (5 * 1000)) {
        return Promise.reject(new Error('Submission interval is too short'));
      }

      return Language.findOne({ slug: req.body.language }).populate({
        path: 'solution',
        populate: { path: 'user' },
      }).exec();
    })
  // TODO: Check if preceding cell is aleady taken
    .then((existingLanguage) => {
      if (existingLanguage !== null) {
        if (existingLanguage.solution && existingLanguage.solution.size <= code.length) {
          return Promise.reject(new Error('Shorter solution is already submitted'));
        }

        return existingLanguage;
      }

      const language = new Language({
        solution: null,
        slug: languageData.slug,
      });

      return language.save().then(() => language);
    })
    .then((language) => {
      const submission = new Submission({
        language: language._id,
        user: req.user._id,
        code,
        size: code.length,
        status: 'pending',
      });

      return submission.save().then(submission => ({ language, submission }));
    })
    .then(({ language, submission }) => {
      validation.validate(req.user, submission, languageData, language.solution);

      res.json(submission);
    })
    .catch(error => res.status(400).json({
      error: error.message,
    }));
};

/**
 * GET /api/foursquare
 * Foursquare API example.
 */
exports.getFoursquare = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'foursquare');
  async.parallel({
    trendingVenues: (callback) => {
      foursquare.Venues.getTrending('40.7222756', '-74.0022724', { limit: 50 }, token.accessToken, (err, results) => {
        callback(err, results);
      });
    },
    venueDetail: (callback) => {
      foursquare.Venues.getVenue('49da74aef964a5208b5e1fe3', token.accessToken, (err, results) => {
        callback(err, results);
      });
    },
    userCheckins: (callback) => {
      foursquare.Users.getCheckins('self', null, token.accessToken, (err, results) => {
        callback(err, results);
      });
    }
  },
  (err, results) => {
    if (err) { return next(err); }
    res.render('api/foursquare', {
      title: 'Foursquare API',
      trendingVenues: results.trendingVenues,
      venueDetail: results.venueDetail,
      userCheckins: results.userCheckins
    });
  });
};

/**
 * GET /api/tumblr
 * Tumblr API example.
 */
exports.getTumblr = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'tumblr');
  const client = tumblr.createClient({
    consumer_key: process.env.TUMBLR_KEY,
    consumer_secret: process.env.TUMBLR_SECRET,
    token: token.accessToken,
    token_secret: token.tokenSecret
  });
  client.posts('mmosdotcom.tumblr.com', { type: 'photo' }, (err, data) => {
    if (err) { return next(err); }
    res.render('api/tumblr', {
      title: 'Tumblr API',
      blog: data.blog,
      photoset: data.posts[0].photos
    });
  });
};

/**
 * GET /api/facebook
 * Facebook API example.
 */
exports.getFacebook = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'facebook');
  graph.setAccessToken(token.accessToken);
  graph.get(`${req.user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err, results) => {
    if (err) { return next(err); }
    res.render('api/facebook', {
      title: 'Facebook API',
      profile: results
    });
  });
};

/**
 * GET /api/scraping
 * Web scraping example using Cheerio library.
 */
exports.getScraping = (req, res, next) => {
  request.get('https://news.ycombinator.com/', (err, request, body) => {
    if (err) { return next(err); }
    const $ = cheerio.load(body);
    const links = [];
    $('.title a[href^="http"], a[href^="https"]').each((index, element) => {
      links.push($(element));
    });
    res.render('api/scraping', {
      title: 'Web Scraping',
      links
    });
  });
};

/**
 * GET /api/github
 * GitHub API Example.
 */
exports.getGithub = (req, res, next) => {
  const github = new GitHub();
  github.repos.get({ user: 'sahat', repo: 'hackathon-starter' }, (err, repo) => {
    if (err) { return next(err); }
    res.render('api/github', {
      title: 'GitHub API',
      repo
    });
  });
};

/**
 * GET /api/aviary
 * Aviary image processing example.
 */
exports.getAviary = (req, res) => {
  res.render('api/aviary', {
    title: 'Aviary API'
  });
};

/**
 * GET /api/nyt
 * New York Times API example.
 */
exports.getNewYorkTimes = (req, res, next) => {
  const query = {
    'list-name': 'young-adult',
    'api-key': process.env.NYT_KEY
  };
  request.get({ url: 'http://api.nytimes.com/svc/books/v2/lists', qs: query }, (err, request, body) => {
    if (err) { return next(err); }
    if (request.statusCode === 403) {
      return next(new Error('Invalid New York Times API Key'));
    }
    const books = JSON.parse(body).results;
    res.render('api/nyt', {
      title: 'New York Times API',
      books
    });
  });
};

/**
 * GET /api/lastfm
 * Last.fm API example.
 */
exports.getLastfm = (req, res, next) => {
  const lastfm = new LastFmNode({
    api_key: process.env.LASTFM_KEY,
    secret: process.env.LASTFM_SECRET
  });
  async.parallel({
    artistInfo: (done) => {
      lastfm.request('artist.getInfo', {
        artist: 'Roniit',
        handlers: {
          success: (data) => {
            done(null, data);
          },
          error: (err) => {
            done(err);
          }
        }
      });
    },
    artistTopTracks: (done) => {
      lastfm.request('artist.getTopTracks', {
        artist: 'Roniit',
        handlers: {
          success: (data) => {
            done(null, data.toptracks.track.slice(0, 10));
          },
          error: (err) => {
            done(err);
          }
        }
      });
    },
    artistTopAlbums: (done) => {
      lastfm.request('artist.getTopAlbums', {
        artist: 'Roniit',
        handlers: {
          success: (data) => {
            done(null, data.topalbums.album.slice(0, 3));
          },
          error: (err) => {
            done(err);
          }
        }
      });
    }
  },
  (err, results) => {
    if (err) { return next(err); }
    const artist = {
      name: results.artistInfo.artist.name,
      image: results.artistInfo.artist.image.slice(-1)[0]['#text'],
      tags: results.artistInfo.artist.tags.tag,
      bio: results.artistInfo.artist.bio.summary,
      stats: results.artistInfo.artist.stats,
      similar: results.artistInfo.artist.similar.artist,
      topAlbums: results.artistTopAlbums,
      topTracks: results.artistTopTracks
    };
    res.render('api/lastfm', {
      title: 'Last.fm API',
      artist
    });
  });
};

/**
 * GET /api/twitter
 * Twitter API example.
 */
exports.getTwitter = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'twitter');
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });
  T.get('search/tweets', { q: 'nodejs since:2013-01-01', geocode: '40.71448,-74.00598,5mi', count: 10 }, (err, reply) => {
    if (err) { return next(err); }
    res.render('api/twitter', {
      title: 'Twitter API',
      tweets: reply.statuses
    });
  });
};

/**
 * POST /api/twitter
 * Post a tweet.
 */
exports.postTwitter = (req, res, next) => {
  req.assert('tweet', 'Tweet cannot be empty').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/twitter');
  }

  const token = req.user.tokens.find(token => token.kind === 'twitter');
  const T = new Twit({
    consumer_key: process.env.TWITTER_KEY,
    consumer_secret: process.env.TWITTER_SECRET,
    access_token: token.accessToken,
    access_token_secret: token.tokenSecret
  });
  T.post('statuses/update', { status: req.body.tweet }, (err) => {
    if (err) { return next(err); }
    req.flash('success', { msg: 'Your tweet has been posted.' });
    res.redirect('/api/twitter');
  });
};

/**
 * GET /api/steam
 * Steam API example.
 */
exports.getSteam = (req, res, next) => {
  const steamId = '76561197982488301';
  const params = { l: 'english', steamid: steamId, key: process.env.STEAM_KEY };
  async.parallel({
    playerAchievements: (done) => {
      params.appid = '49520';
      request.get({ url: 'http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/', qs: params, json: true }, (err, request, body) => {
        if (request.statusCode === 401) {
          return done(new Error('Invalid Steam API Key'));
        }
        done(err, body);
      });
    },
    playerSummaries: (done) => {
      params.steamids = steamId;
      request.get({ url: 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/', qs: params, json: true }, (err, request, body) => {
        if (request.statusCode === 401) {
          return done(new Error('Missing or Invalid Steam API Key'));
        }
        done(err, body);
      });
    },
    ownedGames: (done) => {
      params.include_appinfo = 1;
      params.include_played_free_games = 1;
      request.get({ url: 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/', qs: params, json: true }, (err, request, body) => {
        if (request.statusCode === 401) {
          return done(new Error('Missing or Invalid Steam API Key'));
        }
        done(err, body);
      });
    }
  },
  (err, results) => {
    if (err) { return next(err); }
    res.render('api/steam', {
      title: 'Steam Web API',
      ownedGames: results.ownedGames.response.games,
      playerAchievemments: results.playerAchievements.playerstats,
      playerSummary: results.playerSummaries.response.players[0]
    });
  });
};

/**
 * GET /api/stripe
 * Stripe API example.
 */
exports.getStripe = (req, res) => {
  res.render('api/stripe', {
    title: 'Stripe API',
    publishableKey: process.env.STRIPE_PKEY
  });
};

/**
 * POST /api/stripe
 * Make a payment.
 */
exports.postStripe = (req, res) => {
  const stripeToken = req.body.stripeToken;
  const stripeEmail = req.body.stripeEmail;
  stripe.charges.create({
    amount: 395,
    currency: 'usd',
    source: stripeToken,
    description: stripeEmail
  }, (err) => {
    if (err && err.type === 'StripeCardError') {
      req.flash('errors', { msg: 'Your card has been declined.' });
      return res.redirect('/api/stripe');
    }
    req.flash('success', { msg: 'Your card has been successfully charged.' });
    res.redirect('/api/stripe');
  });
};

/**
 * GET /api/twilio
 * Twilio API example.
 */
exports.getTwilio = (req, res) => {
  res.render('api/twilio', {
    title: 'Twilio API'
  });
};

/**
 * POST /api/twilio
 * Send a text message using Twilio.
 */
exports.postTwilio = (req, res, next) => {
  req.assert('number', 'Phone number is required.').notEmpty();
  req.assert('message', 'Message cannot be blank.').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/twilio');
  }

  const message = {
    to: req.body.number,
    from: '+13472235148',
    body: req.body.message
  };
  twilio.sendMessage(message, (err, responseData) => {
    if (err) { return next(err.message); }
    req.flash('success', { msg: `Text sent to ${responseData.to}.` });
    res.redirect('/api/twilio');
  });
};

/**
 * GET /api/clockwork
 * Clockwork SMS API example.
 */
exports.getClockwork = (req, res) => {
  res.render('api/clockwork', {
    title: 'Clockwork SMS API'
  });
};

/**
 * POST /api/clockwork
 * Send a text message using Clockwork SMS
 */
exports.postClockwork = (req, res, next) => {
  const message = {
    To: req.body.telephone,
    From: 'Hackathon',
    Content: 'Hello from the Hackathon Starter'
  };
  clockwork.sendSms(message, (err, responseData) => {
    if (err) { return next(err.errDesc); }
    req.flash('success', { msg: `Text sent to ${responseData.responses[0].to}` });
    res.redirect('/api/clockwork');
  });
};

/**
 * GET /api/linkedin
 * LinkedIn API example.
 */
exports.getLinkedin = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'linkedin');
  const linkedin = Linkedin.init(token.accessToken);
  linkedin.people.me((err, $in) => {
    if (err) { return next(err); }
    res.render('api/linkedin', {
      title: 'LinkedIn API',
      profile: $in
    });
  });
};

/**
 * GET /api/instagram
 * Instagram API example.
 */
exports.getInstagram = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'instagram');
  ig.use({ client_id: process.env.INSTAGRAM_ID, client_secret: process.env.INSTAGRAM_SECRET });
  ig.use({ access_token: token.accessToken });
  async.parallel({
    searchByUsername: (done) => {
      ig.user_search('richellemead', (err, users) => {
        done(err, users);
      });
    },
    searchByUserId: (done) => {
      ig.user('175948269', (err, user) => {
        done(err, user);
      });
    },
    popularImages: (done) => {
      ig.media_popular((err, medias) => {
        done(err, medias);
      });
    },
    myRecentMedia: (done) => {
      ig.user_self_media_recent((err, medias) => {
        done(err, medias);
      });
    }
  }, (err, results) => {
    if (err) { return next(err); }
    res.render('api/instagram', {
      title: 'Instagram API',
      usernames: results.searchByUsername,
      userById: results.searchByUserId,
      popularImages: results.popularImages,
      myRecentMedia: results.myRecentMedia
    });
  });
};

/**
 * GET /api/paypal
 * PayPal SDK example.
 */
exports.getPayPal = (req, res, next) => {
  paypal.configure({
    mode: 'sandbox',
    client_id: process.env.PAYPAL_ID,
    client_secret: process.env.PAYPAL_SECRET
  });

  const paymentDetails = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: process.env.PAYPAL_RETURN_URL,
      cancel_url: process.env.PAYPAL_CANCEL_URL
    },
    transactions: [{
      description: 'Hackathon Starter',
      amount: {
        currency: 'USD',
        total: '1.99'
      }
    }]
  };

  paypal.payment.create(paymentDetails, (err, payment) => {
    if (err) { return next(err); }
    req.session.paymentId = payment.id;
    const links = payment.links;
    for (let i = 0; i < links.length; i++) {
      if (links[i].rel === 'approval_url') {
        res.render('api/paypal', {
          approvalUrl: links[i].href
        });
      }
    }
  });
};

/**
 * GET /api/paypal/success
 * PayPal SDK example.
 */
exports.getPayPalSuccess = (req, res) => {
  const paymentId = req.session.paymentId;
  const paymentDetails = { payer_id: req.query.PayerID };
  paypal.payment.execute(paymentId, paymentDetails, (err) => {
    res.render('api/paypal', {
      result: true,
      success: !err
    });
  });
};

/**
 * GET /api/paypal/cancel
 * PayPal SDK example.
 */
exports.getPayPalCancel = (req, res) => {
  req.session.paymentId = null;
  res.render('api/paypal', {
    result: true,
    canceled: true
  });
};

/**
 * GET /api/lob
 * Lob API example.
 */
exports.getLob = (req, res, next) => {
  lob.routes.list({ zip_codes: ['10007'] }, (err, routes) => {
    if (err) { return next(err); }
    res.render('api/lob', {
      title: 'Lob API',
      routes: routes.data[0].routes
    });
  });
};

/**
 * GET /api/upload
 * File Upload API example.
 */

exports.getFileUpload = (req, res) => {
  res.render('api/upload', {
    title: 'File Upload'
  });
};

exports.postFileUpload = (req, res) => {
  req.flash('success', { msg: 'File was uploaded successfully.' });
  res.redirect('/api/upload');
};

/**
 * GET /api/pinterest
 * Pinterest API example.
 */
exports.getPinterest = (req, res, next) => {
  const token = req.user.tokens.find(token => token.kind === 'pinterest');
  request.get({ url: 'https://api.pinterest.com/v1/me/boards/', qs: { access_token: token.accessToken }, json: true }, (err, request, body) => {
    if (err) { return next(err); }
    res.render('api/pinterest', {
      title: 'Pinterest API',
      boards: body.data
    });
  });
};

/**
 * POST /api/pinterest
 * Create a pin.
 */
exports.postPinterest = (req, res, next) => {
  req.assert('board', 'Board is required.').notEmpty();
  req.assert('note', 'Note cannot be blank.').notEmpty();
  req.assert('image_url', 'Image URL cannot be blank.').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/api/pinterest');
  }

  const token = req.user.tokens.find(token => token.kind === 'pinterest');
  const formData = {
    board: req.body.board,
    note: req.body.note,
    link: req.body.link,
    image_url: req.body.image_url
  };

  request.post('https://api.pinterest.com/v1/pins/', { qs: { access_token: token.accessToken }, form: formData }, (err, request, body) => {
    if (err) { return next(err); }
    if (request.statusCode !== 201) {
      req.flash('errors', { msg: JSON.parse(body).message });
      return res.redirect('/api/pinterest');
    }
    req.flash('success', { msg: 'Pin created' });
    res.redirect('/api/pinterest');
  });
};

exports.getGoogleMaps = (req, res) => {
  res.render('api/google-maps', {
    title: 'Google Maps API'
  });
};
