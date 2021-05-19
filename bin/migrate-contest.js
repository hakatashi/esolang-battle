const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const Language = require('../models/Language');
const Submission = require('../models/Submission');
const Execution = require('../models/Execution');
const User = require('../models/User');

mongoose.Promise = global.Promise;

const contestIds = [
	'mayfes2021-practice1',
	'mayfes2021-practice2',
	'mayfes2021-day1',
	'mayfes2021-day2',
];

(async () => {
	const oldConnection = mongoose.createConnection('mongodb://localhost:27017/esolang-battle-hideo54');
	const newConnection = mongoose.createConnection('mongodb://localhost:27017/esolang-battle');

	const OldUser = oldConnection.model('User', User.schema);
	const NewUser = newConnection.model('User', User.schema);

	const OldContest = oldConnection.model('Contest', Contest.schema);
	const NewContest = newConnection.model('Contest', Contest.schema);

	const OldLanguage = oldConnection.model('Language', Language.schema);
	const NewLanguage = newConnection.model('Language', Language.schema);

	const OldSubmission = oldConnection.model('Submission', Submission.schema);
	const NewSubmission = newConnection.model('Submission', Submission.schema);

	const OldExecution = oldConnection.model('Execution', Execution.schema);
	const NewExecution = newConnection.model('Execution', Execution.schema);

	const session = await newConnection.startSession();
	session.startTransaction();

	for (const contestId of contestIds) {
		const contest = await OldContest.findOne({id: contestId});
		const contestObj = contest.toJSON();
		delete contestObj._id;

		const newContest = new NewContest(contestObj);
		await newContest.save();
	}

	for (const user of await OldUser.find().populate('team.contest').exec()) {
		const userObj = user.toJSON();
		delete userObj._id;

		const existingUser = await NewUser.findOne({email: user.email});
		const newTeams = await Promise.all(userObj.team.filter((team) => (
			contestIds.includes(team.contest.id)
		)).map(async (team) => {
			team.contest = await NewContest.findOne({id: team.contest.id});
			return team;
		}));

		if (existingUser) {
			existingUser.team.push(...newTeams);
			existingUser.tokens.push(...userObj.tokens);
			await existingUser.save();
		} else {
			const newUser = new NewUser({
				...userObj,
				team: newTeams,
				tokens: userObj.tokens,
			});
			await newUser.save();
		}
	}

	for (const contestId of contestIds) {
		const oldContest = await OldContest.findOne({id: contestId});
		const newContest = await NewContest.findOne({id: contestId});

		for (const language of await OldLanguage.find({contest: oldContest})) {
			const languageObj = language.toJSON();
			delete languageObj._id;
			delete languageObj.solution;

			const newLanguage = new NewLanguage({
				...languageObj,
				contest: newContest._id,
				solution: null,
			});
			await newLanguage.save();
		}

		for (const submission of await OldSubmission.find({contest: oldContest}).populate('user').populate('language').exec()) {
			const submissionObj = submission.toJSON();
			delete submissionObj._id;

			const user = await NewUser.findOne({email: submission.user.email});
			const language = await NewLanguage.findOne({
				contest: newContest._id,
				slug: submission.language.slug,
			});

			const newSubmission = new NewSubmission({
				...submissionObj,
				contest: newContest._id,
				user: user._id,
				language: language._id,
			});
			await newSubmission.save();
		}

		const oldLanguages = await OldLanguage.find({contest: oldContest});
		for (const execution of await OldExecution.find({language: {$in: oldLanguages.map((language) => language._id)}}).populate('user').populate('language').exec()) {
			const executionObj = execution.toJSON();
			delete executionObj._id;

			if (execution.user === null) {
				continue;
			}

			const user = await NewUser.findOne({email: execution.user.email});
			const language = await NewLanguage.findOne({
				contest: newContest._id,
				slug: execution.language.slug,
			});

			const newExecution = new NewExecution({
				...executionObj,
				user: user._id,
				language: language._id,
			});
			await newExecution.save();
		}

		for (const language of await OldLanguage.find({contest: oldContest}).populate('solution').exec()) {
			if (language.solution === null) {
				continue;
			}

			const newLanguage = await NewLanguage.findOne({
				contest: newContest._id,
				slug: language.slug,
			});
			const newSolution = await NewSubmission.findOne({
				input: language.solution.input,
				output: language.solution.output,
				createdAt: language.solution.createdAt,
			});
			newLanguage.solution = newSolution._id;
			await newLanguage.save();
		}
	}

	session.endSession();

	oldConnection.close();
	newConnection.close();
})();
