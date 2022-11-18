const {stripIndent} = require('common-tags');
const mongoose = require('mongoose');
const docker = require('../engines/docker');
const Contest = require('../models/Contest');
const Language = require('../models/Language');
const Submission = require('../models/Submission');
const User = require('../models/User');

mongoose.Promise = global.Promise;

(async () => {
	await mongoose.connect('mongodb://localhost:27017/esolang-battle');

	await User.updateMany({admin: true}, {$set: {admin: false}});

	for (const id of ['sitositositoo', 'u6606u5e03', 'n4o847', 'hideo54', 'kuromunori', 'ishitatsuyuki', 'hakatashi', 'syobon_hinata']) {
		const user = await User.findOne({email: `${id}@twitter.com`});
		if (user) {
			user.admin = true;
			await user.save();
		}
	}

	await Contest.updateOne(
		{id: 'komabasai2022-practice'},
		{
			name: '駒場祭2022 Practice Contest',
			id: 'komabasai2022-practice',
			start: new Date('2022-11-18T00:00:00+0900'),
			end: new Date('2022-11-20T00:00:00+0900'),
			description: {
				ja: stripIndent`
				\`\`\`
				大文字か小文字かを判定せよ。
				\`\`\`
				## 入力
				* ラテン文字 A から Z の 26 文字が順番に、一行で与えられる。
				* 各文字は大文字あるいは小文字である。
				* 入力の最後には改行が付与される。
				## 出力
				* 与えられた文字それぞれについて、大文字であれば \`1\` を、小文字であれば \`0\` を出力せよ。
				* 出力された文字列に含まれる空白文字（改行含む）は無視される。
				## 制約
				* 入力には必ず大文字がひとつ以上、小文字がひとつ以上含まれる。
				## お知らせ
				今回はライブコードゴルフ完全初心者同士の対決なので、初心者に不親切な言語の資料と、ヒントを用意しました。
				適宜活用してください。
				### 言語
				* Emoji：[https://github.com/n4o847/esolangs/wiki/Emoji](https://github.com/n4o847/esolangs/wiki/Emoji)
				* PPAP：[https://github.com/n4o847/esolangs/wiki/PPAP](https://github.com/n4o847/esolangs/wiki/PPAP)
				* \`><>\`：[https://github.com/n4o847/esolangs/wiki/Fish](https://github.com/n4o847/esolangs/wiki/Fish)
				* Brainfuck：[https://github.com/n4o847/esolangs/wiki/Brainfuck](https://github.com/n4o847/esolangs/wiki/Brainfuck)
				### ヒント
				* ライブコードゴルフは早く出すことが正義で、そして一般にesoによるループは難しいです。愚直に26回書くことも検討してみては？
				## 入出力例
				### 入力
				\`\`\`
				ABCdefghiJKLmnopqRSTUvwxYz
				\`\`\`
				### 出力
				\`\`\`
				11100000011100000111100010
				\`\`\`
				`,
				en: '',
			},
		},
		{upsert: true},
	);

	await Contest.updateOne(
		{id: 'komabasai2022'},
		{
			name: '[TSG LIVE! 9] Live CodeGolf Contest',
			id: 'komabasai2022',
			start: new Date('2022-11-19T13:03:00+0900'),
			end: new Date('2022-11-19T14:33:00+0900'),
			description: {
				ja: stripIndent`
					\`\`\`
					ドミノ倒しで倒れるドミノの数を数えよ。
					\`\`\`

					# 入力

					入力は30行からなる。

					入力の各行は、\`|\`か\`_\`を10文字並べた文字列である。

					各行（最終行を含む）の末尾には、改行（\`\\n\`）が付与される。

					各行の$n$文字目は点$n-1$に対応する。\`|\`はドミノが存在する点を、\`_\`はドミノが存在しない点を意味する。

					ドミノの高さは2.5、各点の間隔は1であり、ドミノの厚みは無視できるものとする。

					# 出力

					点0のドミノを点1の方向に倒したときに、倒れるドミノの個数を各行ごとに出力せよ。出力は空白(改行含む)で区切ること。

					ただし、ここでいう「空白」は、JavaScriptの正規表現で\`\\s\`にマッチする文字のことを指す。

					# 制約

					点0にドミノが存在することは保証されている。

					# 入力例

					\`\`\`
					|___|_|_|_
					||||_|__|_
					|____|_||_
					||||___|||
					|||___||||
					|||_|_|___
					|__|_||___
					|_||______
					|_|||__||_
					|_|_|||___
					|__||__||_
					|___||||_|
					|||_|_||__
					|___|||_||
					|_____|_||
					|____|||||
					||__||||||
					|||_||__|_
					|_||||||__
					||_||__|||
					|_|||_|___
					||_|__|||_
					|__|__||||
					|||__|||__
					|||||_|||_
					|___|_||_|
					|||||__|||
					|__|_____|
					||__||__||
					||||||_|||
					\`\`\`

					# 出力例

					\`\`\`
					1 5 1 4 3
					5 1 3 4 5
					1 1 6 1 1
					1 2 5 7 4
					5 3 1 3 8
					1 5 1 2 9
					\`\`\`

					たとえば2行目の\`||||_|__|_\`の場合、点0,1,2,3,5の合計5つのドミノが倒れる。
				`,
				en: '',
			},
		},
		{upsert: true},
	);

	mongoose.connection.close();
})();
