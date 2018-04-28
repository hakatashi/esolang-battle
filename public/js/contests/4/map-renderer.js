const THREE = require('three');
const TrackballControls = require('three-trackballcontrols');

const snubDodecahedron = require('./snub-dodecahedron.js');

module.exports = (element, onFacesUpdate) => {
	const renderer = new THREE.WebGLRenderer({alpha: true});
	const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1e4);
	const scene = new THREE.Scene();

	scene.add(camera);
	camera.position.set(0, 0, 280);
	camera.lookAt(scene.position);
	element.appendChild(renderer.domElement);

	const controls = new TrackballControls(camera, renderer.domElement);
	controls.noPan = true;
	controls.noZoom = true;

	const material = new THREE.MeshBasicMaterial({color: 0x111111});
	const medians = [];

	for (const [index, polygons] of [snubDodecahedron.triangles, snubDodecahedron.pentagons].entries()) {
		for (const polygon of polygons) {
			const geometry = new THREE.Geometry();

			const vertices = [];

			for (const pointIndex of polygon) {
				const vertex = snubDodecahedron.points[pointIndex];
				const vector = new THREE.Vector3(...vertex.map((value) => value * 100));
				vertices.push(vector);
			}

			const median = vertices.reduce((a, b) => a.clone().add(b)).divideScalar(index === 0 ? 3 : 5);
			geometry.vertices = vertices.map((v) => v.clone().lerp(median, index === 0 ? 0.1 : 0.05));
			medians.push(median);

			if (index === 0) {
				geometry.faces.push(new THREE.Face3(0, 1, 2));
			} else if (index === 1) {
				geometry.faces.push(new THREE.Face3(0, 1, 2));
				geometry.faces.push(new THREE.Face3(0, 2, 3));
				geometry.faces.push(new THREE.Face3(0, 3, 4));
			}
			geometry.computeFaceNormals();

			const mesh = new THREE.Mesh(geometry, material);
			scene.add(mesh);
		}
	}

	renderer.render(scene, camera);

	const update = () => {
		renderer.render(scene, camera);
		controls.update();

		const faces = medians.map((median) => {
			const vector = median.clone();
			vector.project(camera);
			const x = Math.round((vector.x + 1) * renderer.domElement.width / 2);
			const y = Math.round((-vector.y + 1) * renderer.domElement.height / 2);
			return {x, y, z: vector.z};
		});
		onFacesUpdate(faces);

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
