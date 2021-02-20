const mongoose = require('mongoose');
const assert = require('assert');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const Language = require('../models/Language');
const validation = require('../lib/validation');
const languagesData = require('../data/languages');

require('../models/User');

mongoose.Promise = global.Promise;

(async () => {
	await mongoose.connect('mongodb://localhost:27017/esolang-battle');
	const contest = await Contest.findOne({id: '7'});
	const languages = await Language.find({contest, solution: {$ne: null}, slug: 'canvas'});

	// rollback
	for (const language of languages) {
		console.log(`Rejudging language ${language.slug}...`);
		const languageData = languagesData[contest.id].find(
			(l) => l && l.slug === language.slug
		);
		assert(languageData);

		while (true) {
			const submission = await Submission.findOne({
				contest,
				language,
			}).sort({createdAt: -1}).exec();

			if (!submission) {
				console.log('Solution not found.');
				language.solution = null;
				await language.save();
				break;
			}

			console.log(`Rejudging submission ${submission._id}...`);

			await validation.validate({
				submission,
				language: languageData,
				solution: null,
				contest,
				noInputGeneration: true,
			});

			const newSubmission = await Submission.findOne({_id: submission._id});
			assert(newSubmission);
			console.log(newSubmission);

			if (newSubmission.status === 'success') {
				console.log(`Solution found as ${newSubmission._id}`);
				language.solution = newSubmission;
				await language.save();
				break;
			}

			console.log(`${newSubmission._id} is invalid`);
                   break;
		}
	}

	mongoose.connection.close();
})();
