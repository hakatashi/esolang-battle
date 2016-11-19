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
    const csrfToken = $('meta[name=csrf-token]').attr('content');
    params._csrf = csrfToken;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: $.param(params),
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
      $modal.data('language', $language.data('slug'));

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

  $modal.find('.submit-code').click(() => {
    const language = $modal.data('language');

    api.post('/submission', {
      language,
      code: $modal.find('.code').val(),
    }).then(res => res.json()).then((submission) => {
      console.log(submission);
    });
  });
});
