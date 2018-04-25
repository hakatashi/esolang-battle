const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
	name: {type: String},
	id: {type: String, index: {unique: true}},
});

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;
