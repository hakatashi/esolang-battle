const mongoose = require('mongoose');
const User = require('../models/User.js');
const Contest = require('../models/Contest');

mongoose.Promise = global.Promise;

(async () => {
	await mongoose.connect('mongodb://localhost:27017/esolang-battle');
	const hakatashi = await User.findOne({email: 'hakatashi@twitter.com'});
	const contest = await Contest.findOne({id: '4'});
	hakatashi.admin = true;
	hakatashi.team.push({contest, value: 0});
	await hakatashi.save();
	mongoose.connection.close();
})();
