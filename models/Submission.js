const mongoose = require('mongoose');
const moment = require('moment');

const submissionSchema = new mongoose.Schema(
	{
		user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		language: {type: mongoose.Schema.Types.ObjectId, ref: 'Language'},
		contest: {type: mongoose.Schema.Types.ObjectId, ref: 'Contest'},
		status: {type: String, enum: ['pending', 'failed', 'success', 'error']},
		code: Buffer,
		size: {type: Number, min: 0},
		input: String,
		stdout: String,
		stderr: String,
		duration: Number,
		url: String,
		error: {
			name: String,
			stack: String,
		},
	},
	{timestamps: true}
);

submissionSchema.methods.timeText = function() {
	return moment(this.createdAt)
		.utcOffset(9)
		.format('YYYY/MM/DD HH:mm:ss');
};

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
