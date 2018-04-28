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

contestSchema.methods.isOpen = function () {
	if (process.env.NODE_ENV === 'production') {
		return true;
	}

	const now = new Date();
	return this.start <= now && now <= this.end;
};

contestSchema.methods.isStarted = function () {
	if (process.env.NODE_ENV === 'production') {
		return true;
	}

	const now = new Date();
	return this.start <= now;
};

contestSchema.methods.isEnded = function () {
	if (process.env.NODE_ENV === 'production') {
		return false;
	}

	const now = new Date();
	return this.end < now;
};

contestSchema.methods.spanText = function () {
	const startText = moment(this.start)
		.utcOffset(9)
		.format('YYYY/MM/DD HH:mm:ss');
	const endText = moment(this.end)
		.utcOffset(9)
		.format('YYYY/MM/DD HH:mm:ss');
	return `${startText} - ${endText}`;
};

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;
