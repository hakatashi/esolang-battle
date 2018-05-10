const mongoose = require('mongoose');
const Language = require('../models/Language');
const Contest = require('../models/Contest');
require('../models/Submission');
require('../models/User');
const langs = require('../data/langs.json');
const {stripIndent} = require('common-tags');

mongoose.Promise = global.Promise;

(async () => {
	await mongoose.connect('mongodb://localhost:27017/esolang-battle');

	const contest = await Contest.find({id: '4'});
	const languages = await Language.find({contest})
		.populate({
			path: 'solution',
			populate: {path: 'user'},
		})
		.exec();

	languages.sort(({slug: slugA}, {slug: slugB}) => slugA.localeCompare(slugB));
	for (const language of languages) {
		if (language.solution === null) {
			continue;
		}

		const lang = langs.find(({slug}) => slug === language.slug);
		console.log(stripIndent`
			# [${lang.name}](https://esolang.hakatashi.com/contests/4/submissions/${language.solution._id}) (@${language.solution.user.email.replace(/@.+$/, '')})
			**${language.solution.size}** bytes
		`);
		console.log('');
		if (language.solution.size < 1000 && !language.solution.code.toString().match(/[\x00-\x08\x0b\x0c\x0e-\x1F\x7F\x80-\x9F]/)) {
			console.log('```');
			console.log(language.solution.code.toString());
			console.log('```');
			console.log('');
		}
	}

	mongoose.connection.close();
})();
