const Submission = require('../models/Submission');
const User = require('../models/User');
const Language = require('../models/Language');
const moment = require('moment');
const Promise = require('bluebird');

/**
 * GET /submissions
 */
exports.getSubmissions = (req, res) => {
  Promise.try(() => {
    if (req.query.author) {
      return User.findOne({ email: `${req.query.author}@twitter.com` }).then(author => ({ author }));
    }

    return {};
  }).then(({ author }) => {
    if (req.query.language) {
      return Language.findOne({ slug: req.query.language }).then(language => ({ author, language }));
    }

    return { author };
  }).then(({ author, language }) => {
    const page = parseInt(req.query && req.query.page) || 0;
    const query = {};

    if (author) {
      query.user = author._id;
    }

    if (language) {
      query.language = language._id;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    return Submission.find(query)
    .sort({ _id: -1 })
    .populate('user')
    .populate('language')
    .skip(500 * page)
    .limit(500)
    .exec();
  }).then((submissions) => {
    res.render('submissions', {
      title: 'Submissions',
      submissions,
      moment,
    });
  });
};

/**
 * GET /submissions/:submission
 */
exports.getSubmission = (req, res) => {
  const _id = req.params.submission;

  Submission
  .findOne({ _id })
  .populate('user')
  .populate('language')
  .exec()
  .then((submission) => {
    if (submission === null) {
      return res.sendStatus(404);
    }

    res.render('submission', {
      title: 'Submission',
      submission,
      selfTeam: req.user && typeof req.user.team === 'number' && req.user.team === submission.user.team,
    });
  });
};
