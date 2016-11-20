const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema({
  solution: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  slug: { type: String, index: { unique: true } },
}, { timestamps: true });

const Language = mongoose.model('Language', languageSchema);

module.exports = Language;
