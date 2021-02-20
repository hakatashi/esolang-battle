const assert = require('assert');
const flatten = require('lodash/flatten');
const langsData = require('../langs.json');

const languages = [
	['', 'whitespace', 'haskell', ''],
	['hexagony', '', 'ruby', 'kotlin'],
	['csharp', 'c-gcc', '', 'unlambda'],
	['', 'd-gdc', 'befunge98', ''],
];

module.exports = flatten(languages).map((language, index) => {
	if (index === 5 || index === 15) {
		return {
			type: 'base',
			team: 0,
		};
	}

	if (index === 10 || index === 0) {
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
