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

	for (const id of ['hakatashi']) {
		const user = await User.findOne({email: `${id}@twitter.com`});
		user.admin = true;
		await user.save();
	}

	await Contest.updateOne(
		{id: '6'},
		{
			name: 'Esolang Codegolf Contest #6',
			id: '6',
			start: new Date('2020-05-04T13:00:00+0900'),
			end: new Date('2020-05-06T21:00:00+0900'),
			description: {
				ja: stripIndent`
				\`\`\`
				ワクチンを用いてウイルスを撲滅せよ
				\`\`\`

				TSG国では、これまで確認されていなかった新型のウイルスが9種類も同時に発見され、未曾有の災禍をもたらしていました。

				幸い、KMC研究所がそれぞれのウイルスに合わせた9種類のワクチンの開発に成功し、治療に用いられることになりました。

				ところで、このウイルスは特殊な性質を持っており、**一方向に3つ以上同じ種類のウイルスもしくは対応するワクチンが並ぶと消滅します。**

				さて、この新型ウイルスに感染した患者が32人やってきました。

				検査により、体内に存在するウイルスの配列、およびワクチンを投与する場所はすでにわかっています。

				**消滅させられるウイルスを最大化する**ために投与するべきワクチンの種類を答えてください。

				## 入力

				* 空白1文字で区切られた2つ組の3桁の数値が、32組、改行区切りで与えられる。
				  * すなわち1行は空白を含めて7文字で構成される。
				  * これらの数値は1つの桁が1つのウイルスを表し、1ならばウイルス1、2ならばウイルス2、のようにその桁の値がそこに存在するウイルスの種類を表す。
				* 入力の最後には改行が付与される。

				## 出力

				* 32行の入力それぞれについて、以下の問題を解け。
				  * 7文字の入力のうち、空白で表された場所に、ワクチン1～ワクチン9のいずれかを投与する。
				  * ワクチン投与によって消滅させられるウイルスの数を最大化するようなワクチンの種類を、対応する1～9の数字で答えよ。
				  * ただし、そのようなワクチンの種類が複数通りある場合、どれを出力してもかまわない。
				* 都合32個の数字が出力される。
				* **出力された文字列に含まれる空白文字（改行含む）は無視される。**
				* 1から9の数字、および空白文字以外の文字を出力してはいけない。
				* 1から9の数字を32個より多く出力してはいけない。

				## 制約

				* 入力に同一の内容の行は含まれない。
				* 入力に同じ数字が3つ以上並ぶ部分は存在しない。
				* 入力には以下のパターンがすべて必ず2度以上ずつ出現する。
				  * 以下の記法において、同じアルファベットは同じ数字、違うアルファベットは違う数字であることを表す。
				
				### パターン

				* \`AA AA\`
				* \`AA AB\`
				* \`AA BA\`
				* \`AA BB\`
				* \`AA BC\`
				* \`AB AA\`
				* \`AB AB\`
				* \`AB AC\`
				* \`AB BA\`
				* \`AB BB\`
				* \`AB BC\`
				* \`AB CA\`
				* \`AB CB\`
				* \`AB CC\`
				* \`AB CD\`

				## 入出力例

				### 入力1

				\`\`\`
				994 499
				811 211
				879 596
				366 668
				685 879
				122 998
				578 927
				644 779
				628 823
				811 857
				688 891
				812 224
				755 554
				634 236
				972 772
				895 951
				413 556
				953 396
				547 787
				488 583
				446 448
				338 528
				411 155
				366 926
				862 927
				126 273
				528 665
				258 588
				626 664
				614 416
				929 129
				843 716
				\`\`\`

				### 出力1

				\`\`\`
				41566914818256765378451697666495
				\`\`\`

				### 入力2

				\`\`\`
				866 298
				921 442
				412 264
				833 938
				644 758
				598 981
				988 185
				911 114
				367 566
				789 983
				519 815
				994 994
				475 577
				233 776
				797 575
				771 773
				465 525
				678 182
				726 945
				628 589
				939 412
				977 332
				227 288
				843 497
				166 639
				417 146
				322 223
				227 771
				849 499
				476 889
				944 481
				328 883
				\`\`\`

				### 出力2

				\`\`\`
				6
				4
				2
				3
				4
				5
				8
				1
				8
				9
				8
				9
				5
				7
				1
				7
				5
				4
				2
				6
				2
				7
				4
				8
				6
				3
				2
				7
				4
				8
				4
				8
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
