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

	await User.updateMany(
		{admin: true},
		{$set: {admin: false}},
	);

	for (const id of ['__fiord', 'gh_end_', 'hideo54', 'naan112358', 'n4o847']) {
		const user = await User.findOne({email: `${id}@twitter.com`});
		if (user) {
		user.admin = true;
		await user.save();
		}
	}

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
				それ以前のどの数値よりも真に小さい数値の個数を出力せよ
				\`\`\`
				Szkiくんは甘いものに目がなく、毎日おやつを食べていました。
				しかし最近Szkiくんは太ってしまったので、ダイエットのためおやつに制限を設けることにしました。
				制限は、「その日のおやつのカロリーが以前のおやつたちのカロリーのいずれよりも真に小さいとき、おやつを食べる」というものです。
				今日から50日ぶんのおやつのカロリーが2桁の数値で与えられるので、Szkiくんがおやつを食べた日は1、食べなかった日は0を出力してください。
				## 入力
				* 2桁の数値(\`01\`以上\`99\`以下)が50個、改行区切りで与えられる。
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

	for (const slug of ['whitespace', 'pure-folders', 'concise-folders', 'produire']) {
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
