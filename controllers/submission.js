const Submission = require('../models/Submission');
const moment = require('moment');

/**
 * GET /submissions
 */
exports.getSubmissions = (req, res) => {
  const page = parseInt(req.query && req.query.page) || 0;
  Submission
  .find()
  .sort({ _id: -1 })
  .populate('user')
  .populate('language')
  .skip(500 * page)
  .limit(500)
  .exec((err, submissions) => {
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
