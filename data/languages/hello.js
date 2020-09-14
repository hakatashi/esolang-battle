const langsData = require('../langs.json');
const assert = require('assert');

const languages = [
	'crystal', // 京都府
	'whitespace', // 愛知県
	'perl', // 栃木県
	'python3', // 山梨県
	'golfscript', // 滋賀県
	'wake', // 群馬県
	'rail', // 静岡県
	'', // 茨城県(0-base)
	'aheui', // 和歌山県
	'golang', // 岐阜県
	'node', // 大阪府
	'c-gcc', // 長野県
	'brainfuck-esotope', // 三重県
	'', // 兵庫県(1-base)
	'husk', // 千葉県
	'', // 富山県(0-base)
	'', // 東京都(1-base)
	'ruby', // 埼玉県
	'piet', // 石川県
	'unlambda', // 福井県
	'starry', // 奈良県
	'fish', // 新潟県
	'emojicode', // 神奈川県
];

module.exports = languages
	.map((language, index) => {
		if (index === 7 || index === 15) {
			return {
				type: 'base',
				team: 0,
			};
		}
		if (index === 13 || index === 16) {
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
