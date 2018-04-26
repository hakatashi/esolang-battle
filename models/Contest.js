const mongoose = require('mongoose');
const moment = require('moment');

const contestSchema = new mongoose.Schema({
	name: {type: String},
	id: {type: String, index: {unique: true}},
	start: {type: Date},
	end: {type: Date},
	description: {
		ja: {type: String},
		en: {type: String},
	},
});

contestSchema.methods.spanText = function() {
	return `${moment(this.start)
		.utcOffset(9)
		.format('YYYY/MM/DD HH:mm:ss')} - ${moment(this.end)
		.utcOffset(9)
		.format('YYYY/MM/DD HH:mm:ss')}`;
};

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;
