const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const {stripIndent} = require('common-tags');

mongoose.Promise = global.Promise;

(async () => {
	await mongoose.connect('mongodb://localhost:27017/esolang-battle');

	const contest1 = await Contest.findOne({id: 'mayfes2018-day1'});
	contest1.description = {
		ja: stripIndent`
			\`\`\`
			入力された文字列のn文字目ををROT-nせよ
			\`\`\`

			## 入力

			* 大文字のアルファベット26文字からなる文字列が与えられる。
			* 入力は正規表現 \`^[A-Z]{26}$\` で表現される。
			* 入力の最後には改行が付与される。

			## 出力

			* 入力された文字列26文字に対して、n文字目の文字をアルファベット順の順方向にn回ずらした文字を出力せよ。
			  * Zの次の文字はAとする。
			* 出力された文字列に含まれる空白文字はすべて無視される。

			## 例1

			### 入力

			\`\`\`
			AAAAAAAAAAAAAAAAAAAAAAAAAA
			\`\`\`

			### 出力

			\`\`\`
			BCDEFGHIJKLMNOPQRSTUVWXYZA
			\`\`\`

			## 例2

			### 入力

			\`\`\`
			SFBMPCVCSHDKARZHSCTVXSYGST
			\`\`\`

			### 出力

			\`\`\`
			THEQUICKBROWNFOXJUMPSOVERT
			\`\`\`
		`,
		en: stripIndent`
		`,
	};

	await contest1.save();

	const contest2 = await Contest.findOne({id: 'mayfes2018-day2'});
	contest2.description = {
		ja: stripIndent`
			\`\`\`
			入力された文字列のn文字目までに含まれる1の数を数えよ
			\`\`\`

			## 入力

			* 100文字の文字列が与えられる。
			* 入力は正規表現 \`^[01]{100}$\` で表現される。
			* 入力の最後には改行が付与される。

			## 出力

			* 入力された文字列100文字に対して、1～n文字目に含まれる1の数が偶数ならば0を、奇数ならば1をn文字目に出力せよ。
			  * 都合100文字の文字列を出力せよ。
			* 出力された文字列に含まれる空白文字はすべて無視される。

			## 例1

			### 入力

			\`\`\`
			0000000000100000000010000000001000000000100000000010000000001000000000100000000010000000001000000000
			\`\`\`

			### 出力

			\`\`\`
			0000000000111111111100000000001111111111000000000011111111110000000000111111111100000000001111111111
			\`\`\`

			## 例2

			### 入力

			\`\`\`
			1011111001110101100001110111001100010111110110010001100100011101111111000100011111000000100101101000
			\`\`\`

			### 出力

			\`\`\`
			1101010001011001000001011010001000011010100100011110111000010110101010000111101010000000111001001111
			\`\`\`
		`,
		en: stripIndent`
		`,
	};

	await contest2.save();

	mongoose.connection.close();
})();
