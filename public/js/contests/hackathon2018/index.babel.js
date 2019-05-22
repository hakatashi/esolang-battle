import '@babel/polyfill';

const ReactDOM = require('react-dom');
const React = require('react');
const App = require('./app.jsx');

ReactDOM.render(React.createElement(App), document.getElementById('app'));
