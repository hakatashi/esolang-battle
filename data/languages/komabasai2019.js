const langsData = require('../langs.json');
const flatten = require('lodash/flatten');
const assert = require('assert');

const languages = [
	[
		'',
		'produire',
		'sed',
		'calc',
		'',
	],
	[
		'aheui',
		'',
		'python3',
		'',
		'piet',
	],
	[
		'fish',
		'c-gcc',
		'ruby',
		'perl',
		'vim',
	],
	[
		'brainfuck-esotope',
		'',
		'node',
		'',
		'snowman',
	],
	[
		'',
		'whitespace',
		'golfscript',
		'starry',
		'',
	],
];

module.exports = flatten(languages)
	.map((language, index) => {
		if (index === 8 || index === 16) {
			return {
				type: 'base',
				team: 1,
			};
		}

		if (index === 6 || index === 18) {
			return {
				type: 'base',
				team: 0,
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
