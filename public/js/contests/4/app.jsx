const React = require('react');
const mapRenderer = require('./map-renderer.js');

class App extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {};
	}

	handleRefCanvas = (node) => {
		this.canvas = node;
		if (!this.mapInited) {
			this.mapInited = true;
			mapRenderer(this.canvas)
		}
	}

	render() {
		return (
			<div
				ref={this.handleRefCanvas}
			/>
		);
	}
}

module.exports = App;
