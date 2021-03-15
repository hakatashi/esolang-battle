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
			languageColors: Array(10).fill('white'),
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
		const filteredLanguages = languages.filter(({type}) => type !== 'base');
		this.setState({
			languages: filteredLanguages,
			languageColors: filteredLanguages.map((language) => {
				if (language.type === 'unknown') {
					return 'black';
				}

				if (language.team === undefined) {
					if (language.available === true) {
						return 'white';
					}
					return 'grey';
				}

				return ['red', 'blue', 'green', 'orange', 'purple'][language.team];
			}),
		});
	};

	handleClickCell = (event) => {
		const cellIndex = parseInt(
			event.target.closest('.cell').getAttribute('data-index'),
		);
		this.setState(({languages}) => {
			const language = languages[cellIndex];
			if (!language) {
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

	render() {
		const selectedLanguage = this.state.selectedLanguage || {};
		const cellCounts = Array(5)
			.fill()
			.map(
				(_, index) => this.state.languages.filter((language) => language.team === index)
					.length,
			);
		const totalCellCounts = cellCounts.reduce((a, b) => a + b);

		return (
			<div className="world">
				<div className="teams">
					{['Red', 'Blue'].map((color, index) => (
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
				<div className="map">
					{this.state.languages.map((language, index) => (
						<div
							key={index}
							className={`cell ${this.state.languageColors[index]}`}
							onClick={this.handleClickCell}
							style={{
								cursor: language ? 'pointer' : '',
								color:
									language && language.team === undefined ? '#222' : 'white',
							}}
							data-index={index}
						>
							<div className="language-name">
								{language ? language.name : ''}
							</div>
							<div className="language-size">
								{language && language.solution ? language.solution.size : ''}
							</div>
						</div>
					))}
				</div>
				<div className="teams">
					{['Green', 'Orange', 'Purple'].map((color, index) => (
						<div key={color} className={`team ${color.toLowerCase()}`}>
							<div
								className="bar"
								style={{
									flexBasis: `${(cellCounts[index + 2] / totalCellCounts) *
										100}%`,
								}}
							>
								<div className="count">{cellCounts[index + 2]}</div>
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
							<a
								href={selectedLanguage.link}
								target="_blank" rel="noopener noreferrer"
								rel="noopener noreferrer"
							>
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
										href={`/contests/${this.contestId}/submissions/${selectedLanguage.solution._id}`}
										target="_blank" rel="noopener noreferrer"
										rel="noopener noreferrer"
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
											href={`/contests/${this.contestId}/submissions/${this.state.messageDetail}`}
											target="_blank" rel="noopener noreferrer"
											rel="noopener noreferrer"
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
