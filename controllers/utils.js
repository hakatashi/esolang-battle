const Language = require('../models/Language');
const languages = require('../languages');

const getPrecedingIndices = (index) => {
	const x = index % 15;
	const y = Math.floor(index / 15);
	const margin = y < 4 ? 3 - y : y - 4;
	const direction = (x + y) % 2 ? 'up' : 'down';

	const precedingCells = [];

	if (x - 1 >= margin) {
		precedingCells.push(y * 15 + (x - 1));
	}

	if (x + 1 <= 14 - margin) {
		precedingCells.push(y * 15 + (x + 1));
	}

	if (direction === 'down' && y - 1 >= 0) {
		precedingCells.push((y - 1) * 15 + x);
	}

	if (direction === 'up' && y + 1 <= 7) {
		precedingCells.push((y + 1) * 15 + x);
	}

	return precedingCells;
};

module.exports.getPrecedingIndices = getPrecedingIndices;

module.exports.getLanguageMap = async ({team, contest} = {}) => {
	const languageRecords = await Language.find({contest})
		.populate({
			path: 'solution',
			populate: {path: 'user'},
		})
		.exec();

	const languageCells = languages.map((language) => {
		if (language && language.type === 'language') {
			return Object.assign({}, language, {
				record: languageRecords.find(
					(languageRecord) => languageRecord.slug === language.slug
				),
			});
		}

		return Object.assign({}, language);
	});

	return languageCells.map((cell, index) => {
		if (cell.type === 'language') {
			const solvedTeamInfo =
				cell.record &&
				cell.record.solution &&
				cell.record.solution.user.team.find((t) => t.contest.equals(contest._id));
			const solvedTeam = solvedTeamInfo && solvedTeamInfo.value;

			if (new Date() >= new Date('2017-08-26T15:00:00.000Z')) {
				if (cell.record && cell.record.solution) {
					return {
						type: 'language',
						solved: true,
						team: solvedTeam,
						solution: {
							_id: cell.record.solution._id,
							size: cell.record.solution.size,
							user: cell.record.solution.user.name(),
						},
						slug: cell.slug,
						name: cell.name,
						available: false,
					};
				}

				return {
					type: 'language',
					solved: false,
					slug: cell.slug,
					name: cell.name,
					available: false,
				};
			}

			const precedingCells = getPrecedingIndices(index).map(
				(i) => languageCells[i]
			);

			const available =
				typeof team === 'number' &&
				(cell.team === team ||
					solvedTeam === team ||
					precedingCells.some((c) => c.team === team || solvedTeam === team));

			if (cell.record && cell.record.solution) {
				return {
					type: 'language',
					solved: true,
					team: solvedTeam,
					solution: {
						_id: cell.record.solution._id,
						size: cell.record.solution.size,
						user: cell.record.solution.user.name(),
					},
					slug: cell.slug,
					name: cell.name,
					available,
				};
			}

			if (
				precedingCells.some(
					(c) => c.type === 'base' ||
						(c.type === 'language' && c.record && c.record.solution)
				)
			) {
				return {
					type: 'language',
					solved: false,
					slug: cell.slug,
					name: cell.name,
					available,
				};
			}

			return {
				type: 'unknown',
			};
		} else if (cell.type === 'base') {
			return {
				type: 'base',
				team: cell.team,
			};
		}

		return {
			type: 'unknown',
		};
	});
};
