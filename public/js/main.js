/* eslint-env browser, jquery */
/* global io */

const api = (method, endpoint, params = {}) => {
  const url = `/api${endpoint}`;

  if (method === 'GET') {
    return fetch(`${url}?${$.param(params)}`, {
      method: 'GET',
      credentials: 'include',
    }).then(res => res.json());
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
    }).then(res => res.json());
  }

  return Promise.reject();
};

let languageData = [];

const updateLanguages = () => {
  api.get('/languages').then((languages) => {
    languageData = languages;
    $('.language').each((index, languageEl) => {
      const $language = $(languageEl);
      const language = languageData[parseInt($language.data('index'), 10)];

      $language.find('.name').text('');
      $language.attr('data-toggle', language.available ? 'modal' : false);

      if (language) {
        if (language.type === 'unknown') {
          $language.css({
            color: 'white',
          }).addClass('black');
        } else if (language.type === 'language') {
          $language.find('.name').text(language.name);

          if (typeof language.team === 'number') {
            $language.css({
              color: 'white',
            }).addClass(language.team === 0 ? 'red' : 'blue');
          } else {
            $language.css({
              color: '',
            }).addClass(language.available ? 'white' : 'gray');
          }
        } else if (language.type === 'base') {
          if (typeof language.team === 'number') {
            $language.css({
              color: 'white',
            }).addClass(language.team === 0 ? 'red' : 'blue');
          }
        }
      } else {
        $language.css({
          backgroundColor: '',
          color: '',
        });
      }
    });
  });
};

api.get = api.bind(null, 'GET');
api.post = api.bind(null, 'POST');

$(document).ready(() => {
  if (location.pathname !== '/') {
    return;
  }

  const $modal = $('#language-modal');
  let pendingSubmission = {};

  $('.language').each((index, language) => {
    const $language = $(language);

    $language.click(() => {
      const language = languageData[parseInt($language.data('index'), 10)];

      if (!language.slug || !language.available) {
        return true;
      }

      // Set title
      $modal.find('.modal-title').text(language.name);

      $modal.find('.code').val('').attr('readonly', true);
      $modal.find('.submit-code').attr('disabled', true);
      $modal.find('.result').removeClass('bg-warning bg-success').hide();
      $modal.data('language', language.slug);

      if (language.solved) {
        const solutionURL = `${location.origin}/submissions/${language.solution._id}`;
        $modal.find('.owner-name').text(language.solution.user);
        $modal.find('.solution').text(solutionURL).attr('href', solutionURL);
        $modal.find('.solution-bytes').text(language.solution.size);
      } else {
        $modal.find('.owner-name').text('Not Solved');
        $modal.find('.solution').text('N/A').attr('href', '');
        $modal.find('.solution-bytes').text('N/A');
      }

      if (language.available) {
        $modal.find('.code').attr('readonly', false);
        $modal.find('.submit-code').attr('disabled', false);
      }

      return true;
    });
  });

  $modal.find('.submit-code').click(() => {
    const language = $modal.data('language');
    $modal.find('.code').attr('readonly', true);
    $modal.find('.submit-code').attr('disabled', true);
    $modal.find('.result').removeClass('bg-warning bg-success').hide();

    api.post('/submission', {
      language,
      code: $modal.find('.code').val(),
    }).then((submission) => {
      if (submission.error) {
        $modal.find('.result').addClass('bg-warning').text(submission.error).show();
        $modal.find('.code').attr('readonly', true);
        $modal.find('.submit-code').attr('disabled', false);
      } else {
        pendingSubmission = submission;
      }
    });
  });

  updateLanguages();

  const socket = io.connect(window.location.href);

  socket.on('update-submission', (data) => {
    if (data._id === pendingSubmission._id) {
      pendingSubmission = {};

      const getSubmission = () => {
        api.get('/submission', { _id: data._id }).then((submission) => {
          // TODO: XSS
          if (submission.status === 'failed') {
            $modal.find('.result').addClass('bg-warning')
            .html(`<strong>Submission failed.</strong> Check out the detail <a href="${submission.url}" target="_blank">here</a>.`)
            .show();
            $modal.find('.submit-code').attr('disabled', false);
          } else if (submission.status === 'success') {
            $modal.find('.result').addClass('bg-success')
            .html(`<strong>You won the language!</strong> Check out the detail <a href="${submission.url}" target="_blank">here</a>.`)
            .show();
          } else if (submission.status === 'pending') {
            setTimeout(getSubmission, 1000);
          }
        });
      };

      getSubmission();
    }
  });

  socket.on('update-languages', () => {
    updateLanguages();
  });
});
