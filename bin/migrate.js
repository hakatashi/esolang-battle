const {stripIndent} = require('common-tags');
const mongoose = require('mongoose');
const Contest = require('../models/Contest');
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
			start: new Date('2020-05-04T12:30:00+0900'),
			end: new Date('2020-05-06T21:00:00+0900'),
			description: {
				ja: stripIndent`
				\`\`\`
				ウイルスを撲滅せよ
				\`\`\`

				TSG国では、これまで確認されていなかった新型のウイルスが9種類も同時に発見され、未曾有の災禍をもたらしていました。
				幸い、KMC研究所がそれぞれのウイルスに合わせた9種類のワクチンの開発に成功し、治療に用いられることになりました。
				ところで、このウイルスは特殊な性質を持っており、一方向に**3つ以上**同じ種類のウイルスもしくは対応するワクチンが並ぶと消滅します。

				さて、この新型ウイルスに感染した患者が32人やってきました。
				検査により、体内に存在するウイルスの配列、およびワクチンを投与する場所はすでにわかっています。
				**消滅させられるウイルスを最大化する**ために投与するべきワクチンの種類を答えてください。

				## 入力

				* 空白1文字で区切られた2つ組の2桁の数値が、32組、改行区切りで与えられる。
				  * すなわち1行は空白を含めて5文字で構成される。
				  * これらの数値は1つの桁が1つのウイルスを表し、1ならばウイルス1、2ならばウイルス2、のようにその桁の値がそこに存在するウイルスの種類を表す。
				* 入力の最後には改行が付与される。

				## 出力

				* 32行の入力それぞれについて、以下の問題を解け。
				  * 5文字の入力のうち、空白で表された場所に、ワクチン1～ワクチン9のいずれかを投与する。
				  * ワクチン投与によって消滅させられるウイルスの数を最大化するようなワクチンの種類を、対応する1～9の数字で答えよ。
				  * ただし、そのようなワクチンの種類が複数通りある場合、どれを出力してもかまわない。
				* 都合32個の数字が出力される。
				* **出力された文字列に含まれる空白文字（改行含む）は無視される。**
				* 1から9の数字、および空白文字以外の文字を出力してはいけない。
				* 1から9の数字を32個より多く出力してはいけない。

				## 制約

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
				\`\`\`

				### 出力1

				\`\`\`
				\`\`\`
			`,
				en: '',
			},
		},
		{upsert: true},
	);

	mongoose.connection.close();
})();
