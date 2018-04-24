const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
	name: {type: String},
	index: {type: Number, index: {unique: true}},
});

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;
