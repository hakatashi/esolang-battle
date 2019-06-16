const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const {stripIndent} = require('common-tags');

mongoose.Promise = global.Promise;

(async () => {
	await mongoose.connect('mongodb://localhost:27017/esolang-battle');

	await Submission.updateMany(
		{trace: {$exists: false}},
		{$set: {trace: null}},
	);

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
				東京から京都までの道路を建設せよ
				\`\`\`

				## 入力

				* 1行50文字の文字列が複数行与えられる。
				* それぞれの文字は2次元空間上のデカルト座標における格子点を表す。
					* ここで書字方向をx座標、段落方向をy座標とする。
				* 入力に含まれる文字は、空白、改行、\`T\`、\`K\` のいずれかである。
				* 入力中には、必ず \`T\` が1回のみ1行目に、\`K\` が1回のみ最終行に出現する。
					* これらの文字はそれぞれ東京の地点と京都の地点を表す。
				* 入力の最後には改行が付与される。

				## 出力

				この空間において上下左右の4方向に同じコストで移動することができるとき、東京から京都までの最短経路を探索し、図示して出力せよ。

				* 入力と同じ書式を用いて、東京と京都を結ぶのに必要な点を空白以外の文字で、それ以外の部分を空白文字で表現せよ。
					* ここで空白以外の文字とは、ASCIIの印字可能文字のうち空白を除くすべての文字を指す。
				* 必要な経路以外の点を空白以外の文字で表してはならない。
				* 最短でない経路を出力してはならない。
				* 不要な場所に空白が出力されている、改行手前の空白が存在しないなどの空白文字の過不足は、出力において正常に経路が示されている限りにおいて許容される。

				## 制約

				* 入力の行数sは 3 <= s <= 50 を満たす。
				* 東京のx座標をTx、京都のx座標をKxとして、以下の制約を満たす。
					* 10 <= Tx < 50
					* 0 <= Kx < Tx - 3
						* 特に京都のx座標は東京のx座標より必ず小さいことに留意せよ。

				## 入出力例

				### 入力

				\`\`\`
				                      T                           
				                                                  
				                                                  
				                                                  
				                                                  
				                                                  
				         K                                        
				\`\`\`

				### 出力例1

				\`\`\`
				         *************T                           
				         *                                        
				         *                                        
				         *                                        
				         *                                        
				         *                                        
				         K                                        
				\`\`\`

				### 出力例2

				\`\`\`
				                      #                           
				                      #                           
				                      #                           
				         $tsgkmctsgkmc#                           
				         $                                        
				         $                                        
				         $                                        
				\`\`\`

				### 出力例3

				\`\`\`
				                     ##
				                    ##
				               ######
				             ###
			              ##
				          ###
				         ##


				
				\`\`\`
			`,
				en: '',
			},
		},
		{upsert: true}
	);

	mongoose.connection.close();
})();
