const langsData = require('../langs.json');

const languages = [
	'hoge',
	'fuga',
	'piyo',
	'foo',
	'bar',
	'poo',
	'piyo',
	'foo',
	'bar',
	'poo',
];

module.exports = languages.map((language) => {
	const langDatum = langsData.find((lang) => lang.slug === language);

	return {
		type: 'language',
		slug: language,
		name: langDatum ? langDatum.name : '',
		link: langDatum ? langDatum.link : '',
	};
});
