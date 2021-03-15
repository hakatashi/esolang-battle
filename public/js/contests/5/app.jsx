const range = require('lodash/range');
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

const boardShape = [
	'        *****           ',
	'     AAA*****BBB        ',
	'    *****************   ',
	'    *****************   ',
	'*********************   ',
	'*********************   ',
	'  ********************* ',
	' CCC*****************CCC',
	'*********************   ',
	'*********************   ',
	'  ********************* ',
	'     BBB*********AAA    ',
	'      *********         ',
	'                        ',
];

const getColor = (language) => {
	if (!language) {
		return 'black';
	}

	if (language.team === 0) {
		return 'red';
	}

	if (language.team === 1) {
		return 'blue';
	}

	if (language.team === 2) {
		return 'green';
	}

	if (language.type === 'unknown') {
		return 'black';
	}

	if (language.available === true) {
		return 'white';
	}

	return 'gray';
};

class App extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			code: '',
			files: [],
			mapWidth: 0,
			labelsWidth: 0,
			languages: [],
			selectedLanguage: null,
			isPending: false,
			message: null,
			messageType: 'success',
			messageDetail: null,
		};

		this.pendingSubmission = null;

		this.updateLanguages();
		this.initSocket();

		window.addEventListener('resize', this.handleUpdateWindowSize);
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
		const languages = await api('GET', '/contests/5/languages');
		this.setState({languages});
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

		const result = await api('POST', '/contests/5/submission', {
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
		const submission = await api('GET', '/contests/5/submission', {
			_id: data._id,
		});

		if (submission.status === 'failed' || submission.status === 'invalid') {
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

	handleRefSvg = (node) => {
		this.svg = node;
		this.handleUpdateWindowSize();
	};

	handleUpdateWindowSize = async () => {
		if (this.svg) {
			if (window.innerWidth > window.innerHeight) {
				await new Promise((resolve) => {
					this.setState(
						{
							mapWidth: `${this.svg.clientWidth}px`,
						},
						resolve,
					);
				});
			} else {
				await new Promise((resolve) => {
					this.setState(
						{
							mapWidth: '100%',
						},
						resolve,
					);
				});
			}

			this.setState({
				labelsWidth: `${this.svg.clientWidth}px`,
			});
		}
	};

	handleClickCell = (event) => {
		const cellIndex = parseInt(event.target.getAttribute('data-index'));
		this.setState(({languages}) => {
			const language = languages[cellIndex];
			if (!language || !language.solved) {
				return {};
			}
			return {selectedLanguage: language};
		});
	};

	render() {
		const selectedLanguage = this.state.selectedLanguage || {};
		const cellCounts = Array(3)
			.fill()
			.map(
				(_, index) => this.state.languages.filter((language) => language.team === index)
					.length,
			);
		const totalCellCounts = cellCounts.reduce((a, b) => a + b);

		return (
			<div className="world">
				<div className="spacer"/>
				<div
					className="map"
					style={{flexBasis: this.state.mapWidth, width: this.state.mapWidth}}
				>
					<svg
						ref={this.handleRefSvg}
						viewBox="0 0 14.7 15.6"
						className="paint"
					>
						{range(7).map((y) => (
							<g
								key={y}
								style={{
									transform: `translate(${(y % 2) * -1.366}px, ${y * 2.366}px)`,
								}}
							>
								{range(6).map((x) => (
									<g
										key={x}
										style={{transform: `translate(${x * 2.732}px, 0px)`}}
									>
										{[
											'0.5,0.5 1,1.366 0,1.366',
											'0.5,0.5 1.366,0 1.866,0.866 1,1.366',
											'1.366,0 2.366,0 1.866,0.866',
											'2.366,0 3.232,0.5 2.732,1.366 1.866,0.866',
											'0,1.366 1,1.366 1,2.366 0,2.366',
											'1,1.366 1.866,0.866 2.732,1.366 2.732,2.366 1.866,2.866 1,2.366',
										].map((points, i) => {
											const dx = x * 4 + (i % 4);
											const dy = y * 2 + Math.floor(i / 4);
											const index = dy * 24 + dx;
											const language = this.state.languages[index];
											const color = getColor(language);

											if (boardShape[dy][dx] === '*') {
												return (
													<polygon
														key={i}
														className={`cell ${color}`}
														points={points}
														fill="black"
														stroke="white"
														strokeWidth="0.05"
														style={{
															...(language && language.solved
																? {cursor: 'pointer'}
																: {}),
														}}
														onClick={this.handleClickCell}
														data-index={index}
													/>
												);
											}

											if (boardShape[dy][dx].match(/[ABC]/)) {
												const portalNumber =
													boardShape[dy][dx].codePointAt(0) -
													'A'.codePointAt(0);
												return (
													<circle
														key={i}
														cx="1.866"
														cy="1.866"
														r="0.6"
														fill="transparent"
														stroke={
															['#6A1B9A', '#00838F', '#E65100'][portalNumber]
														}
														strokeWidth="0.2"
													/>
												);
											}
											return null;
										})}
									</g>
								))}
							</g>
						))}
					</svg>
					<div
						className="language-labels"
						style={{width: this.state.labelsWidth}}
					>
						{range(7).map((y) => (
							<div key={y}>
								{range(6).map((x) => (
									<div key={x}>
										{[
											{left: 0.5, top: 1.077, width: 0.6, height: 0.6},
											{left: 1.183, top: 0.683, width: 0.8, height: 0.8},
											{left: 1.866, top: 0.288, width: 0.6, height: 0.6},
											{left: 2.549, top: 0.683, width: 0.8, height: 0.8},
											{left: 0.5, top: 1.866, width: 1, height: 1},
											{left: 1.866, top: 1.866, width: 1.6, height: 1.5},
										].map(({left, top, width, height}, i) => {
											const dx = x * 4 + (i % 4);
											const dy = y * 2 + Math.floor(i / 4);
											const index = dy * 24 + dx;
											const language = this.state.languages[index];
											const color = getColor(language);

											if (boardShape[dy][dx] === '*') {
												const cx = x * 2.732 + (y % 2) * -1.366 + left;
												const cy = y * 2.366 + top;

												return (
													<div
														className={`language-label ${color}`}
														key={i}
														style={{
															position: 'absolute',
															left: `${((cx - width / 2) / 14.7) * 100}%`,
															top: `${((cy - height / 2) / 15.6) * 100}%`,
															right: `${100 -
																((cx + width / 2) / 14.7) * 100}%`,
															bottom: `${100 -
																((cy + height / 2) / 15.6) * 100}%`,
														}}
													>
														<div className="language-name">
															{language ? language.name : ''}
														</div>
														<div className="language-size">
															{language && language.solution
																? language.solution.size
																: ''}
														</div>
													</div>
												);
											}
											return null;
										})}
									</div>
								))}
							</div>
						))}
					</div>
				</div>
				<div className="teams">
					{['Red', 'Blue', 'Green'].map((color, index) => (
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
					))}
				</div>
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
									{'Solution: '}
									<a
										href={`/contests/5/submissions/${selectedLanguage.solution._id}`}
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
										{' Check out the detail '}
										<a
											href={`/contests/5/submissions/${this.state.messageDetail}`}
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
						<Button color="primary" onClick={this.handleSend} disabled>
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
