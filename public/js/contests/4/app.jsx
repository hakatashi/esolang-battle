const React = require('react');
const mapRenderer = require('./map-renderer.js');

class App extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			faces: [],
		};
	}

	handleRefCanvas = (node) => {
		this.canvas = node;
		if (!this.mapInited) {
			this.mapInited = true;
			mapRenderer(this.canvas, this.handleFacesUpdate);
		}
	}

	handleFacesUpdate = (faces) => {
		this.setState({faces});
	}

	render() {
		return (
			<div className="map" style={{position: 'relative'}}>
				<div
					ref={this.handleRefCanvas}
				/>
				<div className="labels" style={{pointerEvents: 'none'}}>
					{[...this.state.faces.entries()].filter(([, face]) => face.z < 0.9992).map(([index, face]) => (
						<div
							key={index}
							style={{
								position: 'absolute',
								width: '100px',
								height: '10px',
								color: 'white',
								textAlign: 'center',
								top: `${face.y}px`,
								left: `${face.x}px`,
								transform: 'translate(-50%, -50%)',
							}}
						>
							{index}
						</div>
					))}
				</div>
			</div>

		);
	}
}

module.exports = App;
