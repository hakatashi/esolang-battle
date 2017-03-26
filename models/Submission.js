const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  language: { type: mongoose.Schema.Types.ObjectId, ref: 'Language' },
  status: { type: String, enum: ['pending', 'failed', 'success', 'error'] },
  code: Buffer,
  size: { type: Number, min: 0 },
  input: String,
  stdout: String,
  stderr: String,
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
