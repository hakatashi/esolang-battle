const THREE = require('three');
const TrackballControls = require('three-trackballcontrols');

const snubDodecahedron = require('./snub-dodecahedron.js');

module.exports = (element) => {
	const renderer = new THREE.WebGLRenderer({alpha: true});
	const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1e4);
	const scene = new THREE.Scene();

	scene.add(camera);
	camera.position.set(0, 0, 300);
	camera.lookAt(scene.position);
	element.appendChild(renderer.domElement);

	const controls = new TrackballControls(camera, renderer.domElement);
	controls.noPan = true;
	controls.rotateSpeed = 3;

	const material = new THREE.MeshBasicMaterial({color: 0xFF0000});

	for (const triangle of snubDodecahedron.triangles) {
		const geometry = new THREE.Geometry();

		const vertices = [];

		for (const pointIndex of triangle) {
			const vertex = snubDodecahedron.points[pointIndex];
			const vector = new THREE.Vector3(...vertex.map((value) => value * 100));
			vertices.push(vector);
		}

		const median = vertices.reduce((a, b) => a.clone().add(b)).divideScalar(3);
		geometry.vertices = vertices.map((v) => v.clone().lerp(median, 0.1));

		geometry.faces.push(new THREE.Face3(0, 1, 2));
		geometry.computeFaceNormals();

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);
	}

	renderer.render(scene, camera);

	const update = () => {
		renderer.render(scene, camera);
		controls.update();
		requestAnimationFrame(update);
	};
	requestAnimationFrame(update);

	const onResize = () => {
		const width = window.innerWidth;
		const height = window.innerHeight - 100;
		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	};
	window.addEventListener('resize', onResize);
	onResize();
};
