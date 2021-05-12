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

	for (const id of ['sitositositoo', 'u6606u5e03', 'n4o847']) {
		const user = await User.findOne({email: `${id}@twitter.com`});
		if (user) {
			user.admin = true;
			await user.save();
		}
	}

	await Contest.updateOne(
		{id: 'mayfes2021-practice1'},
		{
			name: '五月祭2021 Practice Contest 1',
			id: 'mayfes2021-practice1',
			start: new Date('2021-04-30T00:00:00+0900'),
			end: new Date('2021-05-15T13:33:00+0900'),
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
		{id: 'mayfes2021-practice2'},
		{
			name: '五月祭2021 Practice Contest 2',
			id: 'mayfes2021-practice2',
			start: new Date('2021-04-30T00:00:00+0900'),
			end: new Date('2021-05-16T12:33:00+0900'),
			description: {
				ja: stripIndent`
				\`\`\`
				それ以前のどの数値よりも真に小さいか判定せよ
				\`\`\`
				Szkiくんは甘いものに目がなく、毎日おやつを食べていました。
				しかし最近Szkiくんは太ってしまったので、ダイエットのためおやつに制限を設けることにしました。
				制限は、「その日のおやつのカロリーが以前のおやつたちのカロリーのいずれよりも真に小さいとき、おやつを食べる」というものです。
				今日から50日ぶんのおやつのカロリーが2桁の数値で与えられるので、Szkiくんがおやつを食べた日は1、食べなかった日は0を出力してください。
				## 入力
				* 2桁の数値(\`10\`以上\`99\`以下)が50個、改行区切りで与えられる。
				* 入力の最後には改行が付与される。
				## 出力
				* 与えられた数値それぞれについて、それ以前に与えられた数値のいずれよりも真に小さいとき1、そうでないとき0を出力せよ。
				## 制約
				* 同じ数値は2度出現しない。
				* 入力の数値は10以上99以下である。
				* 初日については1を出力すること。
				## 入出力例
				### 入力1
				\`\`\`
				88
				18
				21
				41
				55
				46
				64
				58
				67
				86
				89
				28
				72
				12
				77
				83
				93
				61
				23
				15
				53
				34
				35
				81
				96
				10
				76
				82
				19
				51
				49
				47
				59
				84
				24
				87
				71
				33
				20
				94
				45
				56
				90
				39
				85
				50
				40
				26
				69
				68
				\`\`\`
				### 出力1
				\`\`\`
				11000000000001000000000001000000000000000000000000
				\`\`\`
				`,
				en: '',
			},
		},
		{upsert: true},
	);

	await Contest.updateOne(
		{id: 'mayfes2021-day1'},
		{
			name: '五月祭2021 Live CodeGolf Contest Day1',
			id: 'mayfes2021-day1',
			start: new Date('2021-05-15T13:33:00+0900'),
			end: new Date('2021-05-15T14:48:00+0900'),
			description: {
				ja: stripIndent`
				\`\`\`
				季節が巡る向きを判定せよ
				\`\`\`
				昆布くんの趣味は時間旅行ですが、気まぐれに旅をするので、いつも自分が未来へ進んでいるのか過去へ遡っているのか分からなくなってしまいます。
				しかし、昆布くんはとても風流なので、四季の訪れを正確に感じとることができます。昆布くんは春が訪れたら0を、夏なら1を、秋なら2を、冬なら3をメモします。
				4つの季節を体験した時点で、昆布くんはメモを見て自分が向かっている方向が未来なのか過去なのかを判断します。
				例えば春、夏、秋、冬の順に体験した場合、メモには0123と書かれ、未来へ進んでいると判断できます。
				
				昆布くんは32回旅行しました。それぞれのメモが与えられるので、昆布くんが未来に進んでいるときは1を、過去に遡っているときは0を出力してください。
				## 入力
				* \`0\`以上\`4\`以下の数字を4つ並べた文字列が32個、改行区切りで与えられる。
				* 入力の最後には改行が付与される。
				## 出力
				* 各行について\`0123\`, \`1230\`, \`2301\`, \`3012\`のいずれかであれば1、\`3210\`, \`0321\`, \`1032\`, \`2103\`のいずれかであれば0を出力せよ。
				* 出力された文字列に含まれる空白文字（改行含む）は無視される。
				## 制約
				* 入力の各行は\`0123\`, \`1230\`, \`2301\`, \`3012\`, \`3210\`, \`0321\`, \`1032\`, \`2103\`のいずれかであり、かつこれら全てが1回以上現れる。
				## 入出力例
				### 入力
				\`\`\`
				2103
				2301
				3012
				1032
				0123
				0321
				2103
				0123
				3012
				1032
				2301
				0123
				0123
				2103
				2301
				3012
				2301
				0123
				1230
				1032
				3012
				3210
				2103
				0321
				3012
				3012
				0123
				1032
				0321
				3210
				3210
				2301
				
				\`\`\`
				### 出力
				\`\`\`
				01101001101110111110100011100001
				\`\`\`
				`,
				en: '',
			},
		},
		{upsert: true},
	);

	await Contest.updateOne(
		{id: 'mayfes2021-day2'},
		{
			name: '五月祭2021 Live CodeGolf Contest Day2',
			id: 'mayfes2021-day2',
			start: new Date('2021-05-16T12:33:00+0900'),
			end: new Date('2021-05-16T13:48:00+0900'),
			description: {
				ja: stripIndent`
				\`\`\`
				それ以前のどの数値よりも真に小さいか判定せよ
				\`\`\`
				Szkiくんは甘いものに目がなく、毎日おやつを食べていました。
				しかし最近Szkiくんは太ってしまったので、ダイエットのためおやつに制限を設けることにしました。
				制限は、「その日のおやつのカロリーが以前のおやつたちのカロリーのいずれよりも真に小さいとき、おやつを食べる」というものです。
				今日から50日ぶんのおやつのカロリーが2桁の数値で与えられるので、Szkiくんがおやつを食べた日は1、食べなかった日は0を出力してください。
				## 入力
				* 2桁の数値(\`10\`以上\`99\`以下)が50個、改行区切りで与えられる。
				* 入力の最後には改行が付与される。
				## 出力
				* 与えられた数値それぞれについて、それ以前に与えられた数値のいずれよりも真に小さいとき1、そうでないとき0を出力せよ。
				## 制約
				* 同じ数値は2度出現しない。
				* 入力の数値は10以上99以下である。
				* 初日については1を出力すること。
				## 入出力例
				### 入力1
				\`\`\`
				88
				18
				21
				41
				55
				46
				64
				58
				67
				86
				89
				28
				72
				12
				77
				83
				93
				61
				23
				15
				53
				34
				35
				81
				96
				10
				76
				82
				19
				51
				49
				47
				59
				84
				24
				87
				71
				33
				20
				94
				45
				56
				90
				39
				85
				50
				40
				26
				69
				68
				\`\`\`
				### 出力1
				\`\`\`
				11000000000001000000000001000000000000000000000000
				\`\`\`
			`,
				en: '',
			},
		},
		{upsert: true},
	);

	for (const slug of [
		'whitespace',
		'pure-folders',
		'concise-folders',
		'produire',
	]) {
		const languages = await Language.find({slug});
		for (const language of languages) {
			const submissions = await Submission.find({language});
			for (const submission of submissions) {
				console.log('procceing:', submission);

				const disasmInfo = await docker({
					id: slug,
					code: submission.code,
					stdin: '',
					trace: false,
					disasm: true,
				});
				console.log({
					stdout: disasmInfo.stdout.toString(),
					stderr: disasmInfo.stderr.toString(),
				});

				const result = await Submission.update(
					{_id: submission._id},
					{$set: {disasm: disasmInfo.stdout}},
				);
				console.log({result});
			}
		}
	}

	mongoose.connection.close();
})();
