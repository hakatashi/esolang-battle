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

class App extends React.Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			code: '',
			files: [],
			languages: [],
			languageColors: Array(9).fill('white'),
			selectedLanguage: null,
			isPending: false,
			message: null,
			messageType: 'success',
			messageDetail: null,
		};

		this.pendingSubmission = null;
		this.contestId = document
			.querySelector('meta[name=contest-id]')
			.getAttribute('content');

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
					return 'black';
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

	handleClickCell = (event) => {
		const cellIndex = parseInt(event.target.closest('.cell').getAttribute('data-index'));
		this.setState(({languages}) => {
			const language = languages[cellIndex];
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
		const submission = await api('GET', `/contests/${this.contestId}/submission`, {
			_id: data._id,
		});

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

	render() {
		const selectedLanguage = this.state.selectedLanguage || {};
		const cellCounts = Array(3)
			.fill()
			.map(
				(_, index) => this.state.languages.filter((language) => language.team === index)
					.length
			);
		const totalCellCounts = cellCounts.reduce((a, b) => a + b);

		return (
			<div className="world">
				<div className="spacer"/>
				<div className="map">
					{Array(3).fill().map((_, y) => (
						<div key={y} className="row">
							{Array(3).fill().map((_, x) => (
								<div
									key={x}
									className={`cell ${this.state.languageColors[y * 3 + x]}`}
									onClick={this.handleClickCell}
									style={{
										cursor: this.state.languages[y * 3 + x] && this.state.languages[y * 3 + x].available ? 'pointer' : '',
										color:
											this.state.languages[y * 3 + x] &&
											this.state.languages[y * 3 + x].team === undefined
												? '#222'
												: 'white',
									}}
									data-index={y * 3 + x}
								>
									<div className="language-name">
										{this.state.languages[y * 3 + x]
											? this.state.languages[y * 3 + x].name
											: ''}
									</div>
									<div className="language-size">
										{this.state.languages[y * 3 + x] &&
										this.state.languages[y * 3 + x].solution
											? this.state.languages[y * 3 + x].solution.size
											: ''}
									</div>
								</div>
							))}
						</div>
					))}
				</div>
				<div className="teams">
					{['Red', 'Blue'].map((color, index) => (
						<div key={color} className={`team ${color.toLowerCase()}`}>
							<div
								className="bar"
								style={{
									flexBasis: `${cellCounts[index] / totalCellCounts * 100}%`,
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
							<a href={selectedLanguage.link} target="_blank">
								[detail]
							</a>
						</small>
					</ModalHeader>
					<ModalBody>
						{selectedLanguage.solution ? (
							<React.Fragment>
								<p>
									Owner: {selectedLanguage.solution.user} ({
										selectedLanguage.team
									})
								</p>
								<p>
									{'Solution: '}
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
							</React.Fragment>
						) : (
							<React.Fragment>
								<p>Owner: N/A</p>
								<p>Solution: N/A</p>
							</React.Fragment>
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
									<React.Fragment>
										{' Check out the detail '}
										<a
											href={`/contests/${this.contestId}/submissions/${
												this.state.messageDetail
											}`}
											target="_blank"
										>
											here
										</a>.
									</React.Fragment>
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
