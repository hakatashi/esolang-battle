const mongoose = require('mongoose');
const Promise = require('bluebird');
const pick = require('lodash/pick');
const {stripIndent} = require('common-tags');
const Contest = require('../models/Contest.js');
const Language = require('../models/Language.js');
const User = require('../models/User.js');
const Submission = require('../models/Submission.js');

const oldUserSchema = new mongoose.Schema(
	{
		email: {type: String, unique: true},
		password: String,
		passwordResetToken: String,
		passwordResetExpires: Date,

		twitter: String,
		tokens: Array,
		color: String,
		team: {type: Number, enum: [0, 1, 2]},

		profile: {
			name: String,
			gender: String,
			location: String,
			website: String,
			picture: String,
		},
	},
	{timestamps: true, collection: 'users'}
);

const OldUser = mongoose.model('OldUser', oldUserSchema);

mongoose.Promise = global.Promise;

(async () => {
	const userMap = new Map();

	await mongoose.connect('mongodb://localhost:27017/esolang-battle');
	await Contest.insertMany([
		{
			name: 'Esolang Battle #1',
			id: '1',
			start: new Date('2016-11-20T10:00:00+0900'),
			end: new Date('2016-12-24T23:59:59+0900'),
			description: {
				ja: stripIndent`
					\`\`\`
					与えられた100桁の2進数を、10進数に変換せよ。
					\`\`\`

					## 入力

					* 2進数で表現される100桁の整数が与えられる。
					* 入力は正規表現 \`^[01]{100}$\` で表現される。

					## 出力

					* 入力された整数を10進数で出力せよ。
					* 出力された数の前後に含まれる空白文字は無視される。
					* 出力された数の先頭に存在する数字の \`0\` はすべて無視される。
				`,
				en: stripIndent`
					\`\`\`
					Convert the given 100-digit binary integer into decimal.
					\`\`\`

					## Input

					* You are given 100-digit binary integer.
					* Input exactly matches regular expression \`^[01]{100}$\`.

					## Output

					* Output given integer in decimal format.
					* Space characters around the output integer are ignored.
					* Any number of \`0\`s leading the output integer are ignored.
				`,
			},
		},
		{
			name: 'Esolang Codegolf Contest #2',
			id: '2',
			start: new Date('2017-03-27T10:00:00+0900'),
			end: new Date('2017-04-03T23:59:59+0900'),
			description: {
				ja: stripIndent`
					\`\`\`
					1桁の数字100個を小さい順にソートして出力せよ。
					\`\`\`

					## 入力

					* 0から9までの整数100個が、連結されて与えられる。
					* 入力は正規表現 \`^\\d{100}$\` で表現される。

					## 出力

					* 入力された整数を小さい順にソートし、連結して出力せよ。
					* 出力された数の前後に含まれる空白文字は無視される。

					## 制約

					* 入力には0から9までの整数がそれぞれ必ず1個以上含まれる。
				`,
				en: stripIndent`
					\`\`\`
					Sort one hundred digits in ascending order and print it.
					\`\`\`

					## Input

					* You are given 100 digits in joined format.
					* Input exactly matches regular expression \`^\\d{100}$\`.

					## Output

					* Sort the given digits in ascending order and join them, and print it.
					* Space characters around the output integer are ignored.

					## Constraints

					* The input 100 digits include at least one for each of 0 to 9.
				`,
			},
		},
		{
			name: 'Esolang Codegolf Contest #3',
			id: '3',
			start: new Date('2017-08-19T12:00:00+0900'),
			end: new Date('2017-08-26T23:59:59+0900'),
			description: {
				ja: stripIndent`
					\`\`\`
					与えられた8桁の2進数が、三角数かどうか判定せよ。
					\`\`\`

					## 入力

					* 8桁の2進数が50個、改行(LF)区切りで与えられる。

					## 出力

					* 与えられた2進数が三角数なら1を、三角数でないなら0を出力せよ。都合50個の文字が出力される。
					* 0は三角数である。
					* 出力に含まれる空白文字はすべて無視される。
					* 0と1と空白文字以外の文字を出力してはいけない。

					## 制約

					* 与えられる50個の数のうち、三角数は25個含まれる。
					* 含まれる25個の三角数には、255以下の三角数23個が全て含まれる。
					* 重複と順序に関しては保証されない。
				`,
				en: stripIndent`
					\`\`\`
					Determine if the given 8-digit binary number is a triangular number.
					\`\`\`

					## Input

					* You are given 50 8-digit binary numbers, joined with newline (LF).

					## Output

					* Print \`1\` if given binary number is a triangular number, otherwise print \`1\`. 50 characters are printed altogether.
					* 0 is a triangular number.
					* Space characters around the output integer are ignored.
					* Do not print any characters except for \`0\`, \`1\`, or space characters.

					## Constraints

					* 25 triangular numbers are included out of given 50 numbers.
					* All 23 triangular numbers below 256 are included out of 25 triangular numbers.
					* Nothing constraints about duplication and order of input.
				`,
			},
		},
	]);

	await Promise.mapSeries(
		['esolang', 'esolang-new', 'esolang3'],
		async (db, index) => {
			await mongoose.connect('mongodb://localhost:27017/esolang-battle');
			console.log(db);

			const contest = await Contest.findOne({
				id: (index + 1).toString(),
			});

			await mongoose.connect(`mongodb://localhost:27017/${db}`);

			const users = await OldUser.find();
			for (const user of users) {
				userMap.set(user.email, {
					...pick(user, [
						'createdAt',
						'updatedAt',
						'twitter',
						'email',
						'profile',
						'tokens',
					]),
					team: [
						...(userMap.has(user.email) ? userMap.get(user.email).team : []),
						...(user.team === undefined
							? []
							: [
								{
									contest,
									value: user.team,
								},
							  ]),
					],
				});
			}
		}
	);

	await mongoose.connect('mongodb://localhost:27017/esolang-battle');
	const newUsers = await User.insertMany(Array.from(userMap.values()));

	await Promise.mapSeries(
		['esolang', 'esolang-new', 'esolang3'],
		async (db, index) => {
			await mongoose.connect('mongodb://localhost:27017/esolang-battle');

			console.log(index);
			const contest = await Contest.findOne({
				id: (index + 1).toString(),
			});

			await mongoose.connect(`mongodb://localhost:27017/${db}`);

			const languages = await Language.find();
			const newLanguages = languages.map((language) => Object.assign(pick(language, ['createdAt', 'updatedAt', 'slug']), {
				oldId: language._id,
				contest,
			}));

			await mongoose.connect('mongodb://localhost:27017/esolang-battle');

			const insertedLanguages = await Language.insertMany(newLanguages);

			await mongoose.connect(`mongodb://localhost:27017/${db}`);

			const submissions = await Submission.find()
				.populate('user')
				.populate('language')
				.exec();
			const newSubmissions = submissions.map((submission) => ({
				...pick(submission, [
					'createdAt',
					'updatedAt',
					'status',
					'code',
					'input',
					'stderr',
					'url',
				]),
				stdout: submission.stdout || submission.output,
				user: newUsers.find((u) => u.email === submission.user.email),
				language: insertedLanguages.find(
					(l) => l.slug === submission.language.slug
				),
				size: submission.size || submission.code.length,
				contest,
			}));

			console.log(db);

			await mongoose.connect('mongodb://localhost:27017/esolang-battle');
			await Submission.insertMany(newSubmissions);

			console.log(db);
		}
	);

	await Promise.mapSeries(
		['esolang', 'esolang-new', 'esolang3'],
		async (db) => {
			await mongoose.connect(`mongodb://localhost:27017/${db}`);

			const languages = await Language.find()
				.populate('solution')
				.exec();

			await mongoose.connect('mongodb://localhost:27017/esolang-battle');

			for (const language of languages) {
				const newLanguage = await Language.findOne({oldId: language._id});
				console.log(newLanguage.slug);

				delete newLanguage.oldId;
				if (language.solution) {
					newLanguage.solution = await Submission.findOne({
						createdAt: language.solution.createdAt,
					});
				}

				newLanguage.save();
			}
		}
	);

	mongoose.connection.close();
})();
