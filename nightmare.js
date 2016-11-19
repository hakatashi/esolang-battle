/* eslint-env browser */
const Nightmare = require('nightmare');

const code = `
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
`;

const stdin = '1000111010010000110011001100100111101110011101110000010101001000100100001101000010100100000010000110';

const nightmare = Nightmare({ show: false });

nightmare
.goto('https://ideone.com/')
.wait(() => document.readyState === 'complete')
.click('.lang[data-id="11"]')
.wait(() => document.querySelector('#insert-loader').style.display === 'none')
.click('.more-options-more')
.wait('input#syntax')
.evaluate(() => document.querySelector('input#syntax').checked)
.then((checked) => {
  if (!checked) {
    return Promise.resolve();
  }

  return nightmare.click('input#syntax');
})
.then(() => {
  return nightmare
  .insert('textarea#file')
  .insert('textarea#file', code)
  .click('button#button-input')
  .wait('textarea#input')
  .insert('textarea#input')
  .insert('textarea#input', stdin)
  .click('button#Submit')
  .wait('pre#output-text')
  .evaluate(() => document.querySelector('pre#output-text').textContent);
})
.then((stdout) => {
  console.log(stdout);
  nightmare.end();
})
.catch((e) => {
  console.error(e);
});
