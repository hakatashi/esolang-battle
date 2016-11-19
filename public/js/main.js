/* eslint-env browser, jquery */
/* global io */

const api = (method, endpoint, params = {}) => {
  const url = `/api${endpoint}`;

  if (method === 'GET') {
    return fetch(`${url}?${$.param(params)}`, {
      method: 'GET',
      credentials: 'include',
    });
  } else if (method === 'POST') {
    const formData = new FormData();

    Object.keys(formData).forEach((key) => {
      formData.append(key, params[key]);
    });

    return fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
  }

  return Promise.reject();
};

api.get = api.bind(null, 'GET');
api.post = api.bind(null, 'POST');

$(document).ready(() => {
  const socket = io.connect(window.location.href);

  const $modal = $('#language-modal');

  $('.language').each((index, language) => {
    const $language = $(language);

    $language.click(() => {
      // Set title
      $modal.find('.modal-title').text($language.find('.name').text());

      $modal.find('.code').hide();

      api.get(`/languages/${$language.data('slug')}`).then(res => res.json()).then((language) => {
        if (language.engine === 'ideone') {
          $modal.find('.engine-name').attr('href', 'https://ideone.com/').text('ideone');
        } else {
          $modal.find('.engine-name').attr('href', `http://${language.id}.tryitonline.net/`).text('Try it online!');
        }

        if (language.owner === null) {
          $modal.find('.owner-name').text('Not Solved');
          $modal.find('.code').show();
        } else {
          $modal.find('.owner-name').text(language.owner);
        }
      });

      return true;
    });
  });
});
