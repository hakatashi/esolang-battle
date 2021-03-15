const range = require('lodash/range');
const React = require('react');
const corejs = require('core-js');

const {
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Form,
	FormGroup,
	Input,
	CheckBox,
} = require('reactstrap');
const api = require('../../api.js');

const WIDTH = 13;
//const HEIGHT = 15;
const HEIGHT = 13;

class App extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.contestId = document
			.querySelector('meta[name=contest-id]')
			.getAttribute('content');

		this.size = WIDTH;

		this.state = {
			code: '',
			files: [],
			languages: [],
			languageColors: Array(this.size ** 2).fill('white'),
			selectedLanguage: null,
			isPending: false,
			message: null,
			messageType: 'success',
			messageDetail: null,
		};

		this.pendingSubmission = null;

		this.updateLanguages();
		this.initSocket();
	}

	initSocket = () => {
		if (!window.io) {
			setTimeout(this.initSocket, 1000);
			return;
		}

           // TODO Disable WebSocket due to nginx error
		this.socket = window.io(location.origin, { transports: ["polling"]});
		this.socket.on('update-submission', this.handleUpdateSubmission);
		this.socket.on('update-languages', this.handleUpdateLanguages);
	};

	updateLanguages = async () => {
		const languages = await api('GET', `/contests/${this.contestId}/languages`);
		this.setState({
			languages,
			languageColors: languages.map((language) => {
				if (language.type === 'unknown') {
					return 'black';
				}

				if (language.team === undefined) {
					if (language.available === true) {
						return 'white';
					}
					return 'grey';
				}

				return ['red', 'blue', 'green'][language.team];
			}),
		});
	};

	isEmpty = (cell) => {
		const x = cell % WIDTH;
		const y = Math.floor(cell / WIDTH);
		const u = x + Math.floor((y + 1) / 2);
		const v = x - Math.floor(y / 2);

		if (y < 0 || y >= WIDTH || u < 3 || u >= HEIGHT + 3 || v <= -4 || v >= 10) {
			return true;
		}

		return false;
	};

	isEnded = () => (false);

	handleClickCell = (event) => {
		const cellIndex = parseInt(
			event.target.closest('.cell').getAttribute('data-index'),
		);
		this.setState(({languages}) => {
			const language = languages[cellIndex];
			if (!language || (!this.isEnded() && language.available !== true)) {
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
			message: null,
			messageDetail: null,
			selectedLanguage: null,
		});
	};

	handleSend = async () => {
		if (this.state.isPending) {
			return;
		}

		this.setState({
			isPending: true,
			message: null,
			messageDetail: null,
		});

		const result = await api('POST', `/contests/${this.contestId}/submission`, {
			language: this.state.selectedLanguage.slug,
			...(this.state.files.length > 0
				? {file: this.state.files[0]}
				: {code: this.state.code}),
		});

		if (result.error) {
			this.setState({
				message: result.error,
				messageType: 'danger',
				messageDetail: null,
				isPending: false,
			});
		}

		this.pendingSubmission = result._id;
	};

	handleUpdateSubmission = async (data) => {
		if (this.pendingSubmission !== data._id) {
			return;
		}

		this.pendingSubmission = null;
		const submission = await api(
			'GET',
			`/contests/${this.contestId}/submission`,
			{
				_id: data._id,
			},
		);

		if (submission.status === 'failed') {
			this.setState({
				message: 'Submission failed.',
				messageType: 'danger',
				messageDetail: data._id,
				isPending: false,
			});
		} else if (submission.status === 'error') {
			this.setState({
				message: 'Execution timed out.',
				messageType: 'danger',
				messageDetail: data._id,
				isPending: false,
			});
		} else if (submission.status === 'success') {
			this.setState({
				message: 'You won the language!',
				messageType: 'success',
				messageDetail: data._id,
				isPending: false,
			});
		}
	};

	handleUpdateLanguages = () => {
		this.updateLanguages();
	};

	renderTeam = (color, index) => {
		const cellCounts = Array(this.size)
			.fill()
			.map(
				(_, index) => this.state.languages.filter((language) => language.team === index).length,
			);
		const totalCellCounts = cellCounts.reduce((a, b) => a + b);
                const flexBasisCSS = {
						flexBasis: `${(cellCounts[index] / totalCellCounts) * 100}%`,
                };
		return (
			<div key={color} className={`team ${color.toLowerCase()}`}>
				<div
					className="bar"
					style={ flexBasisCSS }
				>
					<div className="count">{cellCounts[index]}</div>
					<div className="team-name">{color}</div>
				</div>
			</div>
		);
	};

	render() {
		const selectedLanguage = this.state.selectedLanguage || {};
                const deniedCSS = {
                   color : 'red',
                }

                const cellCSS = (x, y) => {
                   return {
                      cursor: this.state.languages[y * this.size + x] ? 'pointer' : '',
                      color: (this.state.languageColors[y * this.size + x] === 'white' ) ? 'black' : 'white'
                   }
                }

		return (
			<div className="world">
				<div className="teams left">{this.renderTeam('Blue', 1)}</div>
				<div className="map">
					{Array(HEIGHT)
						.fill()
						.map((_, y) => (
							<div key={y} className="row">
								{Array(WIDTH)
									.fill()
									.map((_, x) => this.isEmpty(y * this.size + x) ? (
										<div key={x} className="cell white empty"/>
									) : (
										<div
											key={x}
											className={`cell ${
												this.state.languageColors[y * this.size + x]
											}`}
											onClick={this.handleClickCell}
											style={ cellCSS(x,y) }
											data-index={y * this.size + x}
										>
											<svg className="hexagon" viewBox="-0.866 -0.866 1.732 1.732">
												<polygon points="-0.866,-0.5 0,-1 0.866,-0.5 0.866,0.5 0,1 -0.866,0.5"/>
											</svg>
											<div className="language-label">
												<div className="language-name">
													{this.state.languages[y * this.size + x]
														? this.state.languages[y * this.size + x].name
														: ''}
												</div>
												<div className="language-size">
													{this.state.languages[y * this.size + x] &&
														this.state.languages[y * this.size + x].solution
														? this.state.languages[y * this.size + x].solution
															.size
														: ''}
												</div>
											</div>
										</div>
									))}
							</div>
						))}
				</div>
				<div className="teams right">{this.renderTeam('Red', 0)}</div>
				<div className="teams right">{this.renderTeam('Green', 2)}</div>
				<Modal
					isOpen={this.state.selectedLanguage !== null}
					toggle={this.handleCloseModal}
					className="language-modal"
				>
					<ModalHeader>
						{selectedLanguage.name}{' '}
						<small>
							<a href={selectedLanguage.link} target="_blank" rel="noopener noreferrer">
								[detail]
							</a>
						</small>
					</ModalHeader>
					<ModalBody>
						{selectedLanguage.solution ? (
							<>
								<p>
									Owner: {selectedLanguage.solution.user} (
									{selectedLanguage.team})
								</p>
								<p>
									Solution:
									<a
										href={`/contests/${this.contestId}/submissions/${
											selectedLanguage.solution._id
										}`}
										target="_blank" rel="noopener noreferrer"
									>
										{selectedLanguage.solution._id}
									</a>
									{` (${selectedLanguage.solution.size} bytes)`}
								</p>
							</>
						) : (
							<>
								<p>Owner: N/A</p>
								<p>Solution: N/A</p>
							</>
						)}
						<p>
							Exec: {
								(selectedLanguage.info && selectedLanguage.info.time > 10) || ['bash-busybox', 'm4', 'cmd'].includes(selectedLanguage.slug) ? 'Allowed' : (
									<strong style={deniedCSS}>Denied</strong>
								)
							}
						</p>
						{typeof selectedLanguage.limit === 'number' && (
							<p>Length Limit: {selectedLanguage.limit.toLocaleString('en-US')} bytes</p>
						)}
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
                                                       Your submission is licensed under CC0-1.0.
						</Form>
						{this.state.message && (
							<p className={`p-3 mb-2 bg-${this.state.messageType} text-white`}>
								{this.state.message}
								{this.state.messageDetail && (
									<>
										{' '}
										Check out the detail
										{' '}
										<a
											href={`/contests/${this.contestId}/submissions/${
												this.state.messageDetail
											}`}
											target="_blank" rel="noopener noreferrer"
										>
											here
										</a>
										.
									</>
								)}
							</p>
						)}
					</ModalBody>
					<ModalFooter>
						<Button
							color="primary"
							onClick={this.handleSend}
							disabled={this.state.isPending}
						>
							Send
						</Button>{' '}
						<Button color="secondary" onClick={this.handleCloseModal}>
							Cancel
						</Button>
					</ModalFooter>
				</Modal>
			</div>
		);
	}
}

module.exports = App;
