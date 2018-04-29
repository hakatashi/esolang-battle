const THREE = require('three');
const TrackballControls = require('three-trackballcontrols');

const snubDodecahedron = require('./snub-dodecahedron.js');

module.exports = class {
	constructor(element, onFacesUpdate) {
		this.onFacesUpdate = onFacesUpdate;
		this.element = element;

		this.renderer = new THREE.WebGLRenderer({alpha: true});
		this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1e4);
		this.scene = new THREE.Scene();

		this.scene.add(this.camera);
		this.camera.position.set(-60, 30, 260);
		this.camera.lookAt(this.scene.position);
		this.element.appendChild(this.renderer.domElement);

		this.controls = new TrackballControls(this.camera, this.renderer.domElement);
		this.controls.noPan = true;
		this.controls.noZoom = true;

		this.faceMedians = [];
		let faceIndex = 0;

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
				this.faceMedians.push(median);

				if (index === 0) {
					geometry.faces.push(new THREE.Face3(0, 1, 2));
				} else if (index === 1) {
					geometry.faces.push(new THREE.Face3(0, 1, 2));
					geometry.faces.push(new THREE.Face3(0, 2, 3));
					geometry.faces.push(new THREE.Face3(0, 3, 4));
				}
				geometry.computeFaceNormals();

				const material = new THREE.MeshBasicMaterial({color: 0x111111});
				const mesh = new THREE.Mesh(geometry, material);
				mesh.index = faceIndex;
				faceIndex++;
				this.scene.add(mesh);
			}
		}

		this.raycaster = new THREE.Raycaster();
		this.mouse = {x: 0, y: 0};

		requestAnimationFrame(this.handleAnimationFrame);

		window.addEventListener('resize', this.handleResize);
		this.handleResize();

		window.addEventListener('mousemove', this.handleMouseMove);
	}

	handleAnimationFrame = () => {
		this.controls.update();

		this.raycaster.setFromCamera(this.mouse, this.camera);
		const intersects = this.raycaster.intersectObjects(this.scene.children).map((intersect) => intersect.object.index);
		for (const mesh of this.scene.children) {
			if (mesh.type === 'Mesh') {
				if (intersects.includes(mesh.index)) {
					mesh.material.color.setHex(0x333333);
				} else {
					mesh.material.color.setHex(0x111111);
				}
			}
		}

		const faces = this.faceMedians.map((median) => {
			const vector = median.clone();
			vector.project(this.camera);
			const x = Math.round((vector.x + 1) * this.renderer.domElement.width / 2);
			const y = Math.round((-vector.y + 1) * this.renderer.domElement.height / 2);
			return {x, y, z: vector.z};
		});
		this.onFacesUpdate(faces);

		this.renderer.render(this.scene, this.camera);

		requestAnimationFrame(this.handleAnimationFrame);
	};

	handleResize = () => {
		const width = window.innerWidth;
		const height = window.innerHeight - 70;
		this.renderer.setSize(width, height);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
	};

	handleMouseMove = (event) => {
		this.mouse.x = 2 * (event.offsetX / this.renderer.domElement.width) - 1;
		this.mouse.y = 1 - 2 * (event.offsetY / this.renderer.domElement.height);
	};
};
