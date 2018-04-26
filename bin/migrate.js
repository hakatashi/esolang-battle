const mongoose = require('mongoose');
const Promise = require('bluebird');
const pick = require('lodash/pick');
const Contest = require('../models/Contest.js');
const Language = require('../models/Language.js');
const User = require('../models/User.js');
const Submission = require('../models/Submission.js');

const oldUserSchema = new mongoose.Schema(
	{
		email: {type: String, unique: true},
		password: String,
		passwordResetToken: String,
		passwordResetExpires: Date,

		twitter: String,
		tokens: Array,
		color: String,
		team: {type: Number, enum: [0, 1, 2]},

		profile: {
			name: String,
			gender: String,
			location: String,
			website: String,
			picture: String,
		},
	},
	{timestamps: true, collection: 'users'}
);

const OldUser = mongoose.model('OldUser', oldUserSchema);

mongoose.Promise = global.Promise;

(async () => {
	const userMap = new Map();

	await mongoose.connect('mongodb://localhost:27017/esolang-battle');
	await Contest.insertMany([
		{
			name: 'Esolang Battle #1',
			id: '1',
			start: new Date('2016-11-20T10:00:00+0900'),
			end: new Date('2016-12-24T23:59:59+0900'),
		},
		{
			name: 'Esolang Codegolf Contest #2',
			id: '2',
			start: new Date('2017-03-27T10:00:00+0900'),
			end: new Date('2017-04-03T23:59:59+0900'),
		},
		{
			name: 'Esolang Codegolf Contest #3',
			id: '3',
			start: new Date('2017-08-19T12:00:00+0900'),
			end: new Date('2017-08-26T23:59:59+0900'),
		},
	]);

	await Promise.mapSeries(
		['esolang', 'esolang-new', 'esolang3'],
		async (db, index) => {
			await mongoose.connect('mongodb://localhost:27017/esolang-battle');
			console.log(db);

			const contest = await Contest.findOne({
				id: (index + 1).toString(),
			});

			await mongoose.connect(`mongodb://localhost:27017/${db}`);

			const users = await OldUser.find();
			for (const user of users) {
				userMap.set(user.email, {
					...pick(user, [
						'createdAt',
						'updatedAt',
						'twitter',
						'email',
						'profile',
						'tokens',
					]),
					team: [
						...(userMap.has(user.email) ? userMap.get(user.email).team : []),
						...(user.team === undefined
							? []
							: [
								{
									contest,
									value: user.team,
								},
							  ]),
					],
				});
			}
		}
	);

	await mongoose.connect('mongodb://localhost:27017/esolang-battle');
	const newUsers = await User.insertMany(Array.from(userMap.values()));

	await Promise.mapSeries(
		['esolang', 'esolang-new', 'esolang3'],
		async (db, index) => {
			await mongoose.connect('mongodb://localhost:27017/esolang-battle');

			console.log(index);
			const contest = await Contest.findOne({
				id: (index + 1).toString(),
			});

			await mongoose.connect(`mongodb://localhost:27017/${db}`);

			const languages = await Language.find();
			const newLanguages = languages.map((language) => Object.assign(pick(language, ['createdAt', 'updatedAt', 'slug']), {
				oldId: language._id,
				contest,
			}));

			await mongoose.connect('mongodb://localhost:27017/esolang-battle');

			const insertedLanguages = await Language.insertMany(newLanguages);

			await mongoose.connect(`mongodb://localhost:27017/${db}`);

			const submissions = await Submission.find()
				.populate('user')
				.populate('language')
				.exec();
			const newSubmissions = submissions.map((submission) => ({
				...pick(submission, [
					'createdAt',
					'updatedAt',
					'status',
					'code',
					'input',
					'stderr',
					'url',
				]),
				stdout: submission.stdout || submission.output,
				user: newUsers.find((u) => u.email === submission.user.email),
				language: insertedLanguages.find(
					(l) => l.slug === submission.language.slug
				),
				size: submission.size || submission.code.length,
				contest,
			}));

			console.log(db);

			await mongoose.connect('mongodb://localhost:27017/esolang-battle');
			await Submission.insertMany(newSubmissions);

			console.log(db);
		}
	);

	await Promise.mapSeries(
		['esolang', 'esolang-new', 'esolang3'],
		async (db) => {
			await mongoose.connect(`mongodb://localhost:27017/${db}`);

			const languages = await Language.find()
				.populate('solution')
				.exec();

			await mongoose.connect('mongodb://localhost:27017/esolang-battle');

			for (const language of languages) {
				const newLanguage = await Language.findOne({oldId: language._id});
				console.log(newLanguage.slug);

				delete newLanguage.oldId;
				if (language.solution) {
					newLanguage.solution = await Submission.findOne({
						createdAt: language.solution.createdAt,
					});
				}

				newLanguage.save();
			}
		}
	);

	mongoose.connection.close();
})();
