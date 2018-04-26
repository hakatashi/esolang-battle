const mongoose = require('mongoose');
const Contest = require('../models/Contest.js');

mongoose.Promise = global.Promise;

(async () => {
	await mongoose.connect('mongodb://localhost:27017/esolang-battle');
	const contest = new Contest({
		name: 'Esolang Codegolf Contest #4',
		id: '4',
		start: new Date('2018-04-30T10:00:00+0900'),
		end: new Date('2017-05-07T23:59:59+0900'),
		description: {en: '', ja: ''},
	});
	await contest.save();

	mongoose.connection.close();
})();
