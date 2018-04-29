const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema(
	{
		user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
		language: {type: mongoose.Schema.Types.ObjectId, ref: 'Language'},
		code: Buffer,
		input: String,
		stdout: String,
		stderr: String,
		duration: Number,
	},
	{timestamps: true}
);

const Execution = mongoose.model('Execution', executionSchema);

module.exports = Execution;
