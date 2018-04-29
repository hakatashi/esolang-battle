const React = require('react');
const {Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Input} = require('reactstrap');
const Map = require('./map.js');
const api = require('./api.js');

class App extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			code: '',
			faces: [],
			languages: [],
			selectedLanguage: null,
		};

		this.handleUpdateLanguages();
	}

	handleUpdateLanguages = async () => {
		const languages = await api('GET', '/contests/4/languages');
		this.setState({languages});
		this.map && this.map.setFaceColors(languages.map((language) => language.team === undefined ? 0 : language.team + 2));
	}

	handleRefCanvas = (node) => {
		this.canvas = node;
		if (!this.mapInited) {
			this.mapInited = true;
			this.map = new Map(this.canvas, this.handleFacesUpdate, this.handleClickFace);
		}
	};

	handleFacesUpdate = (faces) => {
		this.setState({faces});
	};

	handleClickFace = (faceIndex) => {
		this.setState(({languages}) => {
			const language = languages[faceIndex];
			if (!language || language.available !== true) {
				return {};
			}
			return {selectedLanguage: language};
		});
	};

	handleChangeCode = (event) => {
		this.setState({
			code: event.target.value,
		});
	};

	handleChangeFile = (event) => {
		this.setState({
			files: event.target.files,
		});
	};

	handleCloseModal = () => {
		this.setState({
			code: '',
			files: [],
			selectedLanguage: null,
		});
	}

	render() {
		return (
			<div>
				<div className="map">
					<div ref={this.handleRefCanvas}/>
					<div className="language-labels">
						{[...this.state.faces.entries()]
							.filter(([, face]) => face.z < 0.99915)
							.map(([index, face]) => (
								<div
									key={index}
									className="language-label"
									style={{
										transform: `translate(${face.x}px, ${face.y}px) translate(-50%, -50%) scale(${(0.99915 - face.z) * 3000})`,
									}}
								>
									{(this.state.languages[index] && this.state.languages[index].name) || index}
								</div>
							))}
					</div>
				</div>
				<Modal isOpen={this.state.selectedLanguage !== null} toggle={this.handleCloseModal} className="language-modal">
					<ModalHeader>{this.state.selectedLanguage && this.state.selectedLanguage.name}</ModalHeader>
					<ModalBody>
						<Form>
							<FormGroup
								disabled={!this.state.files || this.state.files.length === 0}
							>
								<Input
									type="textarea"
									className="code"
									value={this.state.code}
									onChange={this.handleChangeCode}
									disabled={this.state.files && this.state.files.length > 0}
								/>
							</FormGroup>
							<FormGroup>
								<Input type="file" onChange={this.handleChangeFile}/>
							</FormGroup>
						</Form>
					</ModalBody>
					<ModalFooter>
						<Button color="primary" onClick={this.handleClickModalSend}>Send</Button>{' '}
						<Button color="secondary" onClick={this.handleCloseModal}>Cancel</Button>
					</ModalFooter>
				</Modal>
			</div>
		);
	}
}

module.exports = App;
