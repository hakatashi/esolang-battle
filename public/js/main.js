/* eslint-env browser, jquery */
/* global io */

const api = (method, endpoint, params = {}) => {
  const url = `/api${endpoint}`;

  if (method === 'GET') {
    return fetch(`${url}?${$.param(params)}`, {
      method: 'GET',
    });
  } else if (method === 'POST') {
    const formData = new FormData();

    Object.keys(formData).forEach((key) => {
      formData.append(key, params[key]);
    });

    return fetch(url, {
      method: 'POST',
      body: formData,
    });
  }

  return Promise.reject();
};

api.get = api.bind(null, 'GET');
api.post = api.bind(null, 'POST');

$(document).ready(() => {
  const socket = io.connect(window.location.href);

  const $languageModal = $('#language-modal');

  $('.language').each((index, language) => {
    const $language = $(language);

    $language.click(() => {
      // Set title
      $languageModal.find('.modal-title').text($language.find('.name').text());

      api.get(`/languages/${$language.data('slug')}`).then(res => res.json()).then((data) => {
        console.log(data);
      });

      return true;
    });
  });
});
