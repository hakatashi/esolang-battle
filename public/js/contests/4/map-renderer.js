const THREE = require('three');
const TrackballControls = require('three-trackballcontrols');

module.exports = (element) => {
	const renderer = new THREE.WebGLRenderer({alpha: true});
	const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1e4);
	const scene = new THREE.Scene();

	scene.add(camera);
	camera.position.set(0, 0, 400);
	camera.lookAt(scene.position);
	renderer.setSize(window.innerWidth, window.innerHeight - 100);
	camera.aspect = window.innerWidth / (window.innerHeight - 100);
	camera.updateProjectionMatrix();
	element.appendChild(renderer.domElement);

	const controls = new TrackballControls(camera, renderer.domElement);
	controls.noPan = true;
	controls.rotateSpeed = 3;

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
};
