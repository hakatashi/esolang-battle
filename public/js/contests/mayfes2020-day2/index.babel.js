import '@babel/polyfill';

const React = require('react');
const ReactDOM = require('react-dom');
const Simple = require('./app.jsx');

ReactDOM.render(React.createElement(Simple), document.getElementById('app'));
