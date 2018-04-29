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

	handleClickModalCancel = () => {
		this.setState({
			selectedLanguage: null,
		});
	}

	handleToggleModal = () => {
		this.setState({
			selectedLanguage: null,
		});
	}

	render() {
		return (
			<div>
				<div className="map" style={{position: 'relative'}}>
					<div ref={this.handleRefCanvas}/>
					<div className="labels" style={{pointerEvents: 'none'}}>
						{[...this.state.faces.entries()]
							.filter(([, face]) => face.z < 0.99915)
							.map(([index, face]) => (
								<div
									key={index}
									style={{
										position: 'absolute',
										width: '200px',
										lineHeight: '42px',
										color: 'white',
										fontSize: '30px',
										textAlign: 'center',
										top: '0',
										left: '0',
										transform: `translate(${face.x}px, ${face.y}px) translate(-50%, -50%) scale(${(0.99915 - face.z) * 3000})`,
									}}
								>
									{(this.state.languages[index] && this.state.languages[index].name) || index}
								</div>
							))}
					</div>
				</div>
				<Modal isOpen={this.state.selectedLanguage !== null} toggle={this.handleToggleModal}>
					<ModalHeader>{this.state.selectedLanguage && this.state.selectedLanguage.name}</ModalHeader>
					<ModalBody>
						<Form>
							<FormGroup>
								<Input
									type="textarea"
									value={this.state.code}
									onChange={this.handleChangeCode}
									style={{
										height: '200px',
										fontFamily: 'monospace',
										whiteSpace: 'pre',
										overflowWrap: 'normal',
										overflowX: 'scroll',
										lineHeight: 1,
									}}
								/>
							</FormGroup>
							<FormGroup>
								<Input type="file"/>
							</FormGroup>
						</Form>
					</ModalBody>
					<ModalFooter>
						<Button color="primary" onClick={this.handleClickModalSend}>Send</Button>{' '}
						<Button color="secondary" onClick={this.handleClickModalCancel}>Cancel</Button>
					</ModalFooter>
				</Modal>
			</div>
		);
	}
}

module.exports = App;
