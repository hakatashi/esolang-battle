const mongoose = require('mongoose');
const User = require('../models/User.js');
const Contest = require('../models/Contest');
const {stripIndent} = require('common-tags');

mongoose.Promise = global.Promise;

(async () => {
	await mongoose.connect('mongodb://localhost:27017/esolang-battle');

	const hakatashi = await User.findOne({email: 'hakatashi@twitter.com'});
	hakatashi.admin = true;
	await hakatashi.save();

	const contest = await Contest.findOne({id: '4'});
	contest.description = {
		ja: stripIndent`
			\`\`\`
			入力された4つの点を頂点とする四面体の体積を求めよ。
			\`\`\`

			## 入力

			* 3次元空間上の4つの点の座標 \`A\`, \`B\`, \`C\`, \`D\` が改行(LF)区切りで与えられる。
			* 各座標は2桁の数字3つの空白区切りで表現され、それぞれX軸、Y軸、Z軸の値を表す。
			  * 10未満の数字は先頭が0で詰められる。
			* 入力の各行は正規表現 \`^\\d{2} \\d{2} \\d{2}$\` で表現される。
			* 入力の最後には改行が付与される。

			## 出力

			* 入力された4つの点を頂点とする四面体の体積を整数で出力せよ。
			* 出力された数の前後に含まれる空白文字は無視される。
			* 出力された数の先頭に存在する数字の \`0\` はすべて無視される。
			* 数字と空白文字以外の文字を出力してはいけない。

			## 制約

			* 各座標のX軸、Y軸、Z軸の値は1以上99以下の整数である。
			* 四面体の体積は整数であることが保証される。
			* 四面体の体積は5000以上であることが保証される。
			* 右手系の座標系において点 \`A\` から三角形 \`BCD\` を見たとき、点 \`B\`, \`C\`, \`D\` がこの順で時計回りに並んでいることが保証される。
		`,
		en: stripIndent`
			\`\`\`
			Calculate the volume of tetrahedron consisted of given four points.
			\`\`\`

			## Input

			* You are given three-dimentional coordinates of four points \`A\`, \`B\`, \`C\`, \`D\` joined with line feeds.
			* Each coordinates are expressed as three 2-digits numbers joined with spaces. These numbers are X, Y, Z value of each cordinates.
			  * Numbers below 10 will be padded by zeros.
			* Each line exactly matches regular expression \`^\\d{2} \\d{2} \\d{2}$\`.
			* A line feed is appended at the end of input.

			## Output

			* Output the volume of tetrahedron consisted of given four points as integer.
			* Space characters around the output integer are ignored.
			* Any number of \`0\`s leading the output integer are ignored.
			* Do not output characters other than numbers and space characters.

			## Constraints

			* Each value of each coordinates are intergers above 0 and below 100.
			* The volume of tetrahedron is guaranteed to be integer.
			* The volume of tetrahedron is guaranteed to be above or equal to 5000.
			* In right-handed coordinate system, it is guaranteed that points \`B\`, \`C\`, \`D\` are ordered clockwise when you see triangle \`BCD\` from the view of point \`A\`,.
		`,
	};

	await contest.save();

	mongoose.connection.close();
})();
