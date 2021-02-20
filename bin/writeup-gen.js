const mongoose = require('mongoose');
const Language = require('../models/Language');
const Contest = require('../models/Contest');
const isValidUTF8 = require('utf-8-validate');
require('../models/Submission');
require('../models/User');
const langs = require('../data/langs.json');
const {stripIndent} = require('common-tags');

mongoose.Promise = global.Promise;

(async () => {
	await mongoose.connect('mongodb://localhost:27017/esolang-battle');

	const contest = await Contest.find({id: '5'});
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
			# [${lang.name}](https://esolang-codegolf.hiromi-mi.jp/contests/7/submissions/${language.solution._id}) (@${language.solution.user.email.replace(/@.+$/, '')}, ${language.solution.size} bytes)
		`);
		console.log('');
		const isVisible = isValidUTF8(language.solution.code);
		if (isVisible) {
			if (language.solution.size >= 500) {
				console.log([
					'<details>',
					'',
					'<summary>コードを見る</summary>',
					'',
				].join('\n'));
			}
			console.log('```');
			console.log(language.solution.code.toString());
			console.log('```');
			console.log('');
			if (language.solution.size >= 500) {
				console.log('</details>');
				console.log('');
			}
		}
	}

	mongoose.connection.close();
})();
