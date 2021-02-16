const assert = require('assert');
const flatten = require('lodash/flatten');
const langsData = require('../langs.json');

const languages = [
	['', 'whitespace', 'bash-busybox', ''],
	['starry', '', 'python3', 'php'],
	['node', 'ruby', '', 'vim'],
	['', 'java', 'fish', ''],
];

module.exports = flatten(languages).map((language, index) => {
	if (index === 5) {
		return {
			type: 'base',
			team: 0,
		};
	}

	if (index === 10) {
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
