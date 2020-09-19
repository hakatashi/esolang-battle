const React = require('react');
const {
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Form,
	FormGroup,
	Input,
} = require('reactstrap');
const api = require('../../api.js');
const japanJSON = require('./japan.json');
const { flatten } = require('lodash');

const jp = japanJSON.features;

class App extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.contestId = document
			.querySelector('meta[name=contest-id]')
			.getAttribute('content');

		this.size = 23;

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

		this.socket = window.io(location.origin);
		this.socket.on('update-submission', this.handleUpdateSubmission);
		this.socket.on('update-languages', this.handleUpdateLanguages);
	};

	updateLanguages = async () => {
		const languages = await api('GET', `/contests/${this.contestId}/languages`);
		this.setState({
			languages,
			languageColors: languages.map((language) => {
				if (language.type === 'unknown') {
					return 'grey';
				}

				if (language.team === undefined) {
					if (language.available === true) {
						return 'white';
					}
					return 'grey';
				}

				return ['red', 'blue'][language.team];
			}),
		});
	};

	isEnded = () => (false);

	handleClickCell = (event) => {
		const cellIndex = parseInt(
			event.target.closest('.cell').getAttribute('data-index'),
		);
		console.log(cellIndex);
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
				(_, i) => this.state.languages.filter((language) => language.team === i).length,
			);
		const totalCellCounts = cellCounts.reduce((a, b) => a + b);
		return (
			<div key={color} className={`team ${color.toLowerCase()}`}>
				<div
					className="bar"
					style={{
						flexBasis: `${(cellCounts[index] / totalCellCounts) * 100}%`,
					}}
				>
					<div className="count">{cellCounts[index]}</div>
					<div className="team-name">{color}</div>
				</div>
			</div>
		);
	};

	geoJSONBbox = (geo) => {
		if (geo.type === 'Polygon') {
			return geo.coordinates[0].reduce((acc, cur) =>
				[Math.min(acc[0], cur[0]), Math.min(acc[1], cur[1]), Math.max(acc[2], cur[0]), Math.max(acc[3], cur[1])],
			flatten([geo.coordinates[0][0], geo.coordinates[0][0]]));
		} else if (geo.type === 'MultiPolygon') {
			const mapped = geo.coordinates.map((polygon) => polygon[0].reduce((acc, cur) =>
				[Math.min(acc[0], cur[0]), Math.min(acc[1], cur[1]), Math.max(acc[2], cur[0]), Math.max(acc[3], cur[1])],
			flatten([polygon[0][0], polygon[0][0]])));
			return mapped.reduce((acc, cur) =>
				[Math.min(acc[0], cur[0]), Math.min(acc[1], cur[1]), Math.max(acc[2], cur[2]), Math.max(acc[3], cur[3])],
			mapped[0]);
		}
		return null;
	};

	render() {
		const selectedLanguage = this.state.selectedLanguage || {};

		return (
			<div className="world">
				<div className="teams left">{this.renderTeam('Blue', 1)}</div>
				<div className="map" color="black">
					<svg viewBox={japanJSON.bbox.join(' ')}>
						{Array(23)
							.fill()
							.map((_, x) => {
								return (
									<g
										key={x}
										data-index={x}
										className={`cell ${this.state.languageColors[x]}`}
										onClick={this.handleClickCell}
										fill={this.state.languages[x] &&
											this.state.languages[x].team ===
												undefined
											? '#222'
											: 'white'}
										stroke={this.state.languages[x] &&
											this.state.languages[x].team ===
												undefined
											? '#222'
											: '#222'}
										strokeWidth="0.01"
										style={{
											cursor:
												this.state.languages[x]
													? 'pointer'
													: '',
										}}
									>
										{jp[x].geometry.type === 'Polygon' ? (
											<polygon
												points={jp[x].geometry.coordinates[0].map((v) => v.join(',')).join(' ')}
											/>
										) : jp[x].geometry.type === 'MultiPolygon' && jp[x].geometry.coordinates.map((polygon, i) => (
											<polygon
												key={i}
												points={polygon[0].map((v) => v.join(',')).join(' ')}
											/>
										))}
									</g>
								);
							})}
						{Array(23)
							.fill()
							.map((_, x) => {
								const centerPos = jp[x].center;
								const langName = this.state.languages[x] ? this.state.languages[x].name : '';
								return (
									<g
										key={x}
										id={'language-label-' + x.toString()}
										className="language-label"
										textAnchor="middle"
									>
										<text
											className="language-name"
											x={centerPos[0]}
											y={centerPos[1]}
											fontSize="0.014vmin"
										>
											{langName === 'Brainfuck (esotope)' ? 'Brainfuck' : langName}
										</text>
										<text
											className="language-size"
											dominantBaseline="hanging"
											x={centerPos[0]}
											y={centerPos[1]}
											fontSize="0.014vmin"
										>
											{this.state.languages[x] &&
													this.state.languages[x].solution
												? this.state.languages[x].solution
													.size
												: ''}
										</text>
									</g>
								);
							})}
					</svg>
				</div>
				<div className="teams right">{this.renderTeam('Red', 0)}</div>
				<Modal
					isOpen={this.state.selectedLanguage !== null}
					toggle={this.handleCloseModal}
					className="language-modal"
				>
					<ModalHeader>
						{selectedLanguage.name}{' '}
						<small>
							<a href={selectedLanguage.link} target="_blank">
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
										target="_blank"
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
									<strong style={{color: 'red'}}>Denied</strong>
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
											target="_blank"
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
