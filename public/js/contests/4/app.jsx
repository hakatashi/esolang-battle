const React = require('react');
const THREE = require('three');
const TrackballControls = require('three-trackballcontrols');

class App extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {};
	}

	handleRefCanvas = (node) => {
		this.canvas = node;
		if (!this.threeInited) {
			this.threeInited = true;

			const renderer = new THREE.WebGLRenderer();
			const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1e4);
			const scene = new THREE.Scene();

			scene.add(camera);
			camera.position.set(0, 0, 400);
			camera.lookAt(scene.position);
			renderer.setSize(500, 500);
			this.canvas.appendChild(renderer.domElement);

			const controls = new TrackballControls(camera, renderer.domElement);
			controls.noPan = true;

			const sphereMaterial = new THREE.MeshBasicMaterial({color: 0xCC0000});

			const sphere = new THREE.Mesh(new THREE.BoxBufferGeometry(100, 100, 100), sphereMaterial);
			scene.add(sphere);

			renderer.render(scene, camera);

			const update = () => {
				renderer.render(scene, camera);
				controls.update();
				requestAnimationFrame(update);
			};
			requestAnimationFrame(update);
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
