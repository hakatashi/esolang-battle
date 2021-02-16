import '@babel/polyfill';

const React = require('react');
const ReactDOM = require('react-dom');
const App = require('./app.jsx');

ReactDOM.render(React.createElement(App), document.getElementById('app'));
