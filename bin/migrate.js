const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const {stripIndent} = require('common-tags');

mongoose.Promise = global.Promise;

(async () => {
	await mongoose.connect('mongodb://localhost:27017/esolang-battle');

	const contest1 = new Contest({
		name: '五月祭2018 Live Codegolf Contest day1',
		id: 'mayfes2018-day1',
		start: new Date('2018-05-19T12:10:00+0900'),
		end: new Date('2018-05-19T13:10:00+0900'),
		description: {
			ja: stripIndent`
			`,
			en: stripIndent`
			`,
		},
	});

	await contest1.save();

	const contest2 = new Contest({
		name: '五月祭2018 Live Codegolf Contest day2',
		id: 'mayfes2018-day2',
		start: new Date('2018-05-20T12:10:00+0900'),
		end: new Date('2018-05-20T13:10:00+0900'),
		description: {
			ja: stripIndent`
			`,
			en: stripIndent`
			`,
		},
	});

	await contest2.save();

	mongoose.connection.close();
})();
