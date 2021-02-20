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

	/*
	await User.updateMany(
		{admin: true},
		{$set: {admin: false}},
	);
	await User.updateMany({admin: true}, {$set: {admin: false}});

	for (const id of ['__fiord', 'gh_end_', 'hideo54', 'naan112358', 'n4o847']) {
		const user = await User.findOne({email: `${id}@twitter.com`});
		if (user) {
			user.admin = true;
			await user.save();
		}
	}
	*/
		const user = await User.findOne({email: `hiromi-mi@github.com`});
		user.admin = true;
		await user.save();

	await Contest.updateOne(
		{id: '7'},
		{
			name: 'Esolang Codegolf Contest #7',
			id: '7',
			start: new Date('2021-02-09T13:00:00+0900'),
			end: new Date('2021-02-20T21:00:00+0900'),
			description: {
				ja: stripIndent`
				\`\`\`
                                文字列を反転せよ
				\`\`\`

				TSG国では、これまで確認されていなかった新型のウイルスが9種類も同時に発見され、未曾有の災禍をもたらしていました。

				幸い、KMC研究所がそれぞれのウイルスに合わせた9種類のワクチンの開発に成功し、治療に用いられることになりました。

				ところで、このウイルスは特殊な性質を持っており、**一方向に3つ以上同じ種類のウイルスもしくは対応するワクチンが並ぶと消滅します。**

				さて、この新型ウイルスに感染した患者が32人やってきました。

				検査により、体内に存在するウイルスの配列、およびワクチンを投与する場所はすでにわかっています。`
			},
		},
		{upsert: true},
	);
	await Contest.updateOne(
		{id: 'hello'},
		{
			name: 'Hello Contest',
			id: 'hello',
			start: new Date('2020-09-15T00:00:00+0900'),
			end: new Date('2020-09-21T11:00:00+0900'),
			description: {
				ja: stripIndent`
				"hello" と出力せよ。
				`,
				en: '',
			},
		},
		{upsert: true},
	);

	await Contest.updateOne(
		{id: 'hello2'},
		{
			name: 'Hello Contest 2',
			id: 'hello2',
			start: new Date('2020-09-15T00:00:00+0900'),
			end: new Date('2020-09-20T09:00:00+0900'),
			description: {
				ja: stripIndent`
				"hello" と出力せよ。
				`,
				en: '',
			},
		},
		{upsert: true},
	);

	await Contest.updateOne(
		{id: 'mayfes2020-day1'},
		{
			name: '五月祭2020 Live CodeGolf Contest Day1',
			id: 'mayfes2020-day1',
			start: new Date('2020-09-20T14:03:00+0900'),
			end: new Date('2020-09-20T15:18:00+0900'),
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
		{id: 'mayfes2020-day2'},
		{
			name: '五月祭2020 Live CodeGolf Contest Day2',
			id: 'mayfes2020-day2',
			start: new Date('2020-09-21T12:03:00+0900'),
			end: new Date('2020-09-21T13:18:00+0900'),
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

	/*
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
	*/

	mongoose.connection.close();
})();
