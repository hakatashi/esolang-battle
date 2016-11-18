/* eslint-env browser, jquery */
/* global io */

$(document).ready(() => {
  // Place JavaScript code here...
  const socket = io.connect(window.location.href);
  socket.on('greet', (data) => {
    console.log(data);
    socket.emit('respond', { message: 'Hello to you too, Mr.Server!' });
  });
});
