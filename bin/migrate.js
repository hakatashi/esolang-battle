const mongoose = require('mongoose');
const Contest = require('../models/Contest');

mongoose.Promise = global.Promise;

(async () => {
	await mongoose.connect('mongodb://localhost:27017/esolang-battle');

	const contest = await Contest.findOne({id: 'hackathon2018'});

	contest.name = 'DIY Language Contest 2018';
	contest.start = new Date('2018-09-23T13:00:00+0900');
	contest.end = new Date('2018-09-23T19:00:00+0900');

	await contest.save();

	mongoose.connection.close();
})();
