const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  language: { type: mongoose.Schema.Types.ObjectId, ref: 'Language' },
  status: { type: String, enum: ['pending', 'failed', 'success', 'error'] },
  code: String,
  input: String,
  output: String,
  url: String,
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
