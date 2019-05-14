const langsData = require('../langs.json');
const flatten = require('lodash/flatten');
const assert = require('assert');

const languages = [
	[
		'',
		'snowman',
		'golfscript',
		'',
		'',
	],
	[
		'',
		'perl',
		'c-gcc',
		'',
		'starry',
	],
	[
		'whitespace',
		'java',
		'',
		'ruby',
		'rail',
	],
	[
		'cubix',
		'',
		'python3',
		'node',
		'',
	],
	[
		'',
		'',
		'convex',
		'cardinal',
		'',
	],
];

module.exports = flatten(languages)
	.map((language, index) => {
		if (index === 8 || index === 16) {
			return {
				type: 'base',
				team: 0,
			};
		}

		if (index === 12) {
			return {
				type: 'base',
				team: 1,
			};
		}

		const langDatum = langsData.find((lang) => lang.slug === language);
		assert(language === '' || langDatum !== undefined, language);

		return {
			type: 'language',
			slug: language,
			name: langDatum ? langDatum.name : '',
			link: langDatum ? langDatum.link : '',
		};
	});
