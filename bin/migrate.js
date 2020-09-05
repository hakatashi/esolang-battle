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
