const Submission = require('../models/Submission');

/**
 * GET /submissions
 */
exports.getSubmissions = (req, res) => {
  Submission.find().sort({ _id: -1 }).limit(100).exec((err, submissions) => {
    res.render('submissions', {
      title: 'Submissions',
      submissions,
    });
  });
};
