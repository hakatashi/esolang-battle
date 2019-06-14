const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const {stripIndent} = require('common-tags');

mongoose.Promise = global.Promise;

(async () => {
	await mongoose.connect('mongodb://localhost:27017/esolang-battle');

	await Contest.updateOne(
		{id: '5'},
		{
			name: 'Esolang Codegolf Contest #5',
			id: '5',
			start: new Date('2019-06-16T12:30:00+0900'),
			end: new Date('2019-06-21T16:00:00+0900'),
			description: {
				ja: stripIndent`
				\`\`\`
				連長圧縮を展開せよ
				\`\`\`

				TSGはセキュリティ意識の高いサークルなので、当日喋る内容を暗号化して送ることにしました。

				実況のすずきくんはhakatashiくんから送られてきた暗号文ファイルを見ましたが、事前に伝えられた形式と違っていて困っています。

				どうやらhakatashiくんは暗号文ファイルをさらに圧縮して送ったようです。無駄なことを……。

				かわいそうなすずきくんのために圧縮ファイルを展開してあげてください。

				## 入力

				* 英小文字a-zと数字2-9の列sが与えられる。
				* s中には英小文字が50字ちょうど含まれる。
				* 可能な入力は正規表現 \`/^([a-z][2-9]?){50}$/\` で表現される。
				* 入力の最後には改行が付与される。

				## 出力

				以下のルールに従ってsを展開した後の文字列tを出力せよ。

				* 直後の数字の分だけその英小文字を連続させて繋げる。
				  * 例:a4b3c6→aaaabbbcccccc
				* ただし、連続させる回数が1回のときは数字は書かれない。
				  * 例:a4bc6→aaaabcccccc
				* 出力に含まれる空白文字はすべて無視される。
				  * 改行は空白文字に含まれる。

				## 制約

				* 英小文字が連続する部分は1回以上の出現が保証される。
				* 英小文字のみで構成される長さ3以上の部分文字列が1度以上出現することが保証される。
				* 数字2-9はそれぞれ1回以上出現することが保証される。
				* 入力文字列中に同じ英小文字は連続しない。また数字を1文字挟んで連続することもない。
				* s中で数字が連続することはない。すなわち、出力される英小文字の連続回数は9回以下である。

				## 入出力例

				### 入力

				\`\`\`
				j5y2h8pf6l7rq7e9t8m9n8i6w7r2z5m2t2y3r6x7smd2k3v3s5t6e7i7j5o4p8h9b3uyg8l3q2y3f4c9a3e5o6z7o7b2u5
				\`\`\`

				### 出力

				\`\`\`
				jjjjjyyhhhhhhhhpfffffflllllllrqqqqqqqeeeeeeeeettttttttmmmmmmmmmnnnnnnnniiiiiiwwwwwwwrrzzzzzmmttyyyrrrrrrxxxxxxxsmddkkkvvvssssstttttteeeeeeeiiiiiiijjjjjoooopppppppphhhhhhhhhbbbuygggggggglllqqyyyffffcccccccccaaaeeeeeoooooozzzzzzzooooooobbuuuuu
				\`\`\`
			`,
				en: '',
			},
		},
		{upsert: true}
	);

	mongoose.connection.close();
})();
