![](https://i.imgur.com/RX2OjpL.png)

# Esolang Battle

> Win the esolang master!!!

第1回TSG駒場祭ハッカソンでの余興用に作られたesolangバトルシステムです。

会場: https://esolang.hakatashi.com/

## ルール

* メインの画面上には総計100個のesolang(難解プログラミング言語)が並んでいます。
	* 明らかに難解じゃないプログラミング言語が含まれている気がするのは気のせいです。
* 参加者はそれぞれの言語で「お題」に指定されたプログラムを書き、無事バリデーションを通過することができればそのマスを獲得することができる。
	* 一度獲得されたマスが誰かに再獲得されることはない。
* 終了時点で最も獲得したマスが多い人が勝ち。
* 解答送信後、1分間は別の回答を送信することができない。
	* バックエンドでかなり無茶な実装をしているため。1分待ってもむやみやたらにコードを送りつけるのはやめてほしい。特にideone。

## お題

与えられた100桁の2進数を、10進数に変換して出力するプログラムを書け。

### 補足

* 入力は正規表現`^[01]{100}$`にマッチすることが保証される。
* 出力された10進数の前後に空白文字が含まれていても構わない。
* 出力された10進数の先頭に数字の0が任意個付与されていても構わない。

### 参考実装

### C

```c
#include <stdio.h>
#include <stdbool.h>

#define BIN_LENGTH 100

bool is_all_zero(bool *bin) {
	for (size_t i = 0; i < BIN_LENGTH; i++) {
		if (bin[i] == 1) {
			return false;
		}
	}

	return true;
}

int main() {
	bool bin[BIN_LENGTH];
	char buf[BIN_LENGTH + 1];
	int dec[BIN_LENGTH / 3];
	int dec_len = 0;

	fgets(buf, BIN_LENGTH + 1, stdin);

	for (size_t i = 0; i < BIN_LENGTH; i++) {
		bin[i] = buf[i] - '0';
	}

	for (size_t i = 0; !is_all_zero(bin); i++) {
		int rem = 0;

		for (size_t j = 0; j < BIN_LENGTH; j++) {
			rem *= 2;
			rem += bin[j];
			bin[j] = rem / 10;
			rem %= 10;
		}

		dec[i] = rem;
		dec_len = i + 1;
	}

	for (size_t i = 0; i < dec_len; i++) {
		printf("%c", '0' + dec[dec_len - i - 1]);
	}

	return 0;
}
```

### Node.js

```js
let bin = '';

process.stdin.on('data', (d) => {
  bin += d.toString();
});

process.stdin.on('end', () => {
  bin = bin.trim().split('').map(digit => parseInt(digit, 2));
  let dec = '';

  while (bin.some(digit => digit === 1)) {
    let remainder = 0;

    bin.forEach((digit, index) => {
      remainder *= 2;
      remainder += digit;
      bin[index] = Math.floor(remainder / 10);
      remainder %= 10;
    });

    dec = remainder.toString() + dec;
  }

  console.log(dec);
});
```

### Python

```python
print(int(raw_input(), 2))
```
