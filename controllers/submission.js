const Submission = require('../models/Submission');
const moment = require('moment');

/**
 * GET /submissions
 */
exports.getSubmissions = (req, res) => {
  Submission
  .find()
  .sort({ _id: -1 })
  .populate('user')
  .populate('language')
  .limit(100)
  .exec((err, submissions) => {
    res.render('submissions', {
      title: 'Submissions',
      submissions,
      moment,
    });
  });
};
