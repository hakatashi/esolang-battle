/* eslint-env browser, jquery */
/* global io */

$(document).ready(() => {
  const socket = io.connect(window.location.href);

  const $languageModal = $('#language-modal');

  $('.language').each((index, language) => {
    const $language = $(language);

    $language.click(() => {
      // Set title
      $languageModal.find('.modal-title').text($language.find('.name').text());

      return true;
    });
  });
});
