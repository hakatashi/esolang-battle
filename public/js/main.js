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

    const form = new FormData();
    Object.keys(params).forEach((param) => {
      const value = params[param];

      if (value instanceof HTMLInputElement) {
        form.append(param, value.files[0]);
      } else {
        form.append(param, value);
      }
    });

    form.append('_csrf', csrfToken);

    return fetch(url, {
      method: 'POST',
      body: form,
      credentials: 'include',
    }).then(res => res.json());
  }

  return Promise.reject();
};

let languageData = [];

const updateLanguages = () => {
  api.get('/languages').then((languages) => {
    languageData = languages;

    let red = 0;
    let blue = 0;
    let green = 0;

    const competitionEnd = new Date() >= new Date('2017-08-26T15:00:00.000Z');

    $('.language').each((index, languageEl) => {
      const $language = $(languageEl);
      const language = languageData[parseInt($language.data('index'), 10)];

      $language.find('.name').text('');
      $language.find('.size').text('');
      $language.removeClass('red blue green white gray black');

      if (language) {
        $language.attr('data-toggle', (competitionEnd || language.available) ? 'modal' : false);

        if (language.type === 'unknown') {
          $language.addClass('black');
        } else if (language.type === 'language') {
          $language.find('.name').text(language.name);

          if (language.solved) {
            $language.find('.size').text(language.solution.size);
          }

          if (typeof language.team === 'number') {
            $language.addClass(['red', 'blue', 'green'][language.team]);
          } else {
            $language.addClass(language.available ? 'white' : 'gray');
          }
        } else if (language.type === 'base') {
          if (typeof language.team === 'number') {
            $language.addClass(['red', 'blue', 'green'][language.team]);
          }
        }

        if (language.team === 0) {
          red++;
        } else if (language.team === 1) {
          blue++;
        } else if (language.team === 2) {
          green++;
        }
      } else {
        $language.addClass('black');
      }
    });

    $('.team-info.red > .score').text(red);
    $('.team-info.red > .bar').css({ flexBasis: `${red / (red + blue + green) * 100}%` });

    $('.team-info.blue > .score').text(blue);
    $('.team-info.blue > .bar').css({ flexBasis: `${blue / (red + blue + green) * 100}%` });

    $('.team-info.green > .score').text(green);
    $('.team-info.green > .bar').css({ flexBasis: `${green / (red + blue + green) * 100}%` });
  });
};

api.get = api.bind(null, 'GET');
api.post = api.bind(null, 'POST');

$(document).ready(() => {
  if (location.pathname !== '/') {
    return;
  }

  const $modal = $('#language-modal');
  const competitionEnd = new Date() >= new Date('2017-08-26T15:00:00.000Z');
  let pendingSubmission = {};

  $('.language').each((index, language) => {
    const $language = $(language);

    $language.click(() => {
      const language = languageData[parseInt($language.data('index'), 10)];

      if (!competitionEnd && (!language.slug || !language.available)) {
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
        $modal.find('.owner-name').text(`${language.solution.user} (${['Red', 'Blue', 'Green'][language.team]})`);
        $modal.find('.solution').text(language.solution._id).attr('href', solutionURL);
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

    const params = { language };

    const $file = $modal.find('.file');
    if ($file.get(0).files.length === 1) {
      params.file = $file.get(0);
    } else {
      params.code = $modal.find('.code').val();
    }

    api.post('/submission', params).then((submission) => {
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
              .html(`<strong>Submission failed.</strong> Check out the detail <a href="${location.origin}/submissions/${submission._id}" target="_blank">here</a>.`)
              .show();
            $modal.find('.submit-code').attr('disabled', false);
          } else if (submission.status === 'success') {
            $modal.find('.result').addClass('bg-success')
              .html(`<strong>You won the language!</strong> Check out the detail <a href="${location.origin}/submissions/${submission._id}" target="_blank">here</a>.`)
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
