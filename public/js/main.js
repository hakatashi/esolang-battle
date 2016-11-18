/* eslint-env browser, jquery */
/* global io */

$(document).ready(() => {
  // Place JavaScript code here...
  const socket = io.connect(window.location.href);
});
