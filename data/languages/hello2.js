const langsData = require('../langs.json');
const flatten = require('lodash/flatten');
const assert = require('assert');

const languages = [
	[
		'',
		'golfscript',
		'brainfuck-esotope',
		'bash-busybox',
		'',
	],
	[
		'',
		'',
		'ruby',
		'',
		'',
	],
	[
		'',
		'node',
		'fish',
		'python3',
		'',
	],
	[
		'',
		'',
		'c-gcc',
		'',
		'',
	],
	[
		'',
		'fernando',
		'emoji',
		'ppap',
		'',
	],
];

module.exports = flatten(languages)
	.map((language, index) => {
		if (index === 6 || index === 18) {
			return {
				type: 'base',
				team: 1,
			};
		}

		if (index === 8 || index == 16) {
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
