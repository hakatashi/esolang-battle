const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema(
	{
		solution: {type: mongoose.Schema.Types.ObjectId, ref: 'Submission'},
		contest: {type: mongoose.Schema.Types.ObjectId, ref: 'Contest'},
		oldId: {type: String},
		slug: {type: String},
	},
	{timestamps: true}
);

const Language = mongoose.model('Language', languageSchema);

module.exports = Language;
