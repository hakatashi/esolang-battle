const THREE = require('three');
const OrbitControls = require('three-orbitcontrols');
const TrackballControls = require('three-trackballcontrols');

const snubDodecahedron = require('../../../../data/snub-dodecahedron.js');

module.exports = class {
	constructor(element, onFacesUpdate, onClick) {
		this.onFacesUpdate = onFacesUpdate;
		this.onClick = onClick;
		this.element = element;

		this.renderer = new THREE.WebGLRenderer({alpha: true});
		this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1e4);
		this.scene = new THREE.Scene();

		this.scene.add(this.camera);
		this.camera.position.set(-60, 30, 260);
		this.camera.lookAt(this.scene.position);
		this.element.appendChild(this.renderer.domElement);

		const login =
			document.querySelector('meta[name=login]').getAttribute('content') ===
			'true';

		if (login) {
			this.controls = new TrackballControls(
				this.camera,
				this.renderer.domElement,
			);
			this.controls.noPan = true;
			this.controls.noZoom = true;
		} else {
			this.controls = new OrbitControls(this.camera, this.renderer.domElement);
			this.controls.autoRotate = true;
		}

		this.faceMedians = [];
		this.faceColors = Array(92).fill('black');
		let faceIndex = 0;

		for (const [index, polygons] of [
			snubDodecahedron.triangles,
			snubDodecahedron.pentagons,
		].entries()) {
			for (const polygon of polygons) {
				const geometry = new THREE.Geometry();

				const vertices = [];

				for (const pointIndex of polygon) {
					const vertex = snubDodecahedron.points[pointIndex];
					const vector = new THREE.Vector3(
						...vertex.map((value) => value * 100),
					);
					vertices.push(vector);
				}

				const median = vertices
					.reduce((a, b) => a.clone().add(b))
					.divideScalar(index === 0 ? 3 : 5);
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
		this.mouseDown = {x: 0, y: 0};

		requestAnimationFrame(this.handleAnimationFrame);

		window.addEventListener('resize', this.handleResize);
		this.handleResize();

		this.renderer.domElement.addEventListener(
			'mousedown',
			this.handleMouseDown,
		);
		this.renderer.domElement.addEventListener(
			'mousemove',
			this.handleMouseMove,
		);
		this.renderer.domElement.addEventListener('mouseup', this.handleMouseUp);
	}

	setFaceColors(faceColors) {
		this.faceColors = faceColors;
	}

	handleAnimationFrame = () => {
		this.controls.update();

		this.raycaster.setFromCamera(this.mouse, this.camera);
		const intersects = this.raycaster
			.intersectObjects(this.scene.children)
			.map((intersect) => intersect.object.index);
		for (const mesh of this.scene.children) {
			if (mesh.type === 'Mesh') {
				const faceColor = this.faceColors[mesh.index];
				const color = {
					black: [0x11, 0x11, 0x11],
					grey: [0x55, 0x55, 0x55],
					white: [0xff, 0xff, 0xff],
					red: [0xef, 0x20, 0x11],
					blue: [0x0e, 0x30, 0xec],
					green: [0x16, 0x75, 0x16],
				}[faceColor];

				if (
					faceColor !== 'grey' &&
					faceColor !== 'black' &&
					intersects.includes(mesh.index)
				) {
					const lerpTarget = new THREE.Color(
						this.faceColors[mesh.index] === 'white' ? 'black' : 'white',
					);
					mesh.material.color
						.setRGB(...color.map((v) => v / 0xff))
						.lerp(lerpTarget, 0.2);
				} else {
					mesh.material.color.setRGB(...color.map((v) => v / 0xff));
				}
			}
		}

		const faces = this.faceMedians.map((median) => {
			const vector = median.clone();
			vector.project(this.camera);
			const x = Math.round(
				((vector.x + 1) * this.renderer.domElement.width) / 2,
			);
			const y = Math.round(
				((-vector.y + 1) * this.renderer.domElement.height) / 2,
			);
			return {x, y, z: vector.z};
		});
		this.onFacesUpdate(faces);

		this.renderer.render(this.scene, this.camera);

		requestAnimationFrame(this.handleAnimationFrame);
	};

	handleResize = () => {
		const width = window.innerWidth;
		const height = window.innerHeight - 70;
		const size = Math.min(width, height);
		this.renderer.setSize(size, size);
		this.camera.aspect = 1;
		this.camera.updateProjectionMatrix();
	};

	handleMouseMove = (event) => {
		this.mouse.x = 2 * (event.offsetX / this.renderer.domElement.width) - 1;
		this.mouse.y = 1 - 2 * (event.offsetY / this.renderer.domElement.height);
	};

	handleMouseDown = (event) => {
		this.mouseDown.x = event.pageX;
		this.mouseDown.y = event.pageY;
	};

	handleMouseUp = (event) => {
		if (this.mouseDown.x === event.pageX && this.mouseDown.y === event.pageY) {
			this.raycaster.setFromCamera(this.mouse, this.camera);
			const intersects = this.raycaster.intersectObjects(this.scene.children);
			if (intersects.length > 0) {
				this.onClick(intersects[0].object.index);
			}
		}
	};
};
