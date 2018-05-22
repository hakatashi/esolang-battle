const langsData = require('../langs.json');
const flatten = require('lodash/flatten');

const languages = [
	[
		'',
		'ruby',
		'starry',
	],
	[
		'cjam',
		'c-gcc',
		'golfscript',
	],
	[
		'piet',
		'python3',
		'',
	],
];

module.exports = flatten(languages)
	.map((language, index) => {
		if (index === 0) {
			return {
				type: 'base',
				team: 0,
			};
		}

		if (index === 8) {
			return {
				type: 'base',
				team: 1,
			};
		}

		const langDatum = langsData.find((lang) => lang.slug === language);

		return {
			type: 'language',
			slug: language,
			name: langDatum ? langDatum.name : '',
			link: langDatum ? langDatum.link : '',
		};
	});
