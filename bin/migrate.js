const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const {stripIndent} = require('common-tags');
const User = require('../models/User');

mongoose.Promise = global.Promise;

(async () => {
	await mongoose.connect('mongodb://localhost:27017/esolang-battle');

	await User.updateMany(
		{admin: true},
		{$set: {admin: false}},
	);

	for (const id of ['hakatashi', 'taiyoslime', 'pizzacat83', 'bitmath_']) {
		const user = await User.findOne({email: `${id}@twitter.com`});
		user.admin = true;
		await user.save();
	}

	await Contest.updateOne(
		{id: 'komabasai2019'},
		{
			name: '駒場祭2019 Live Codegolf Contest',
			id: 'komabasai2019',
			start: new Date('2019-11-22T14:03:00+0900'),
			end: new Date('2019-11-22T15:18:00+0900'),
			description: {
				ja: stripIndent`
				\`\`\`
				与えられた2桁の整数が九九表に存在するか判定せよ
				\`\`\`

				## 入力

				* 2桁の数値が100個、改行区切りで与えられる。
				  * 2桁の数値とは10以上99以下の整数である。
				* 入力の最後には改行が付与される。

				## 出力

				* 与えられた数値それぞれについて、数値が九九表に存在するとき1、そうでなければ0を出力せよ。
				  * 数値Nが九九表に存在するとは、ある整数 a, b が存在し、1 <= a, b <= 9 および a × b = N を満たすという意味である。
				  * 都合100個の数が出力される。
				* 出力された文字列に含まれる空白文字（改行含む）は無視される。

				## 制約

				* 入力には10から99までの数値が必ず一度以上出現する。

				## 入出力例

				### 入力

				\`\`\`
				94
				87
				69
				70
				51
				43
				72
				62
				19
				36
				75
				37
				12
				67
				66
				78
				33
				19
				41
				20
				68
				18
				63
				17
				74
				55
				45
				29
				49
				58
				18
				93
				89
				42
				96
				81
				64
				35
				10
				99
				28
				21
				77
				88
				30
				22
				82
				48
				26
				14
				85
				27
				53
				31
				63
				52
				34
				97
				57
				23
				83
				79
				47
				40
				38
				91
				86
				32
				34
				90
				25
				34
				16
				71
				60
				54
				80
				44
				26
				23
				50
				84
				76
				11
				65
				33
				15
				46
				13
				24
				98
				39
				93
				59
				20
				56
				92
				61
				95
				73
				\`\`\`

				### 出力

				\`\`\`
				0000001001001000000101100010101001011110110010010101001000000001000100101001000000000010010000110000
				\`\`\`
			`,
				en: '',
			},
		},
		{upsert: true},
	);

	mongoose.connection.close();
})();
