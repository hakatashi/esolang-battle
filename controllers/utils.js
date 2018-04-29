const Language = require('../models/Language');
const languages = require('../data/languages');
const snubDodecahedron = require('../data/snub-dodecahedron.js');

const getPrecedingIndices = (cellIndex) => {
	const faces = [...snubDodecahedron.triangles, ...snubDodecahedron.pentagons];
	const face = faces[cellIndex];

	return Array(92).fill().map((_, index) => index).filter((index) => {
		if (index === cellIndex) {
			return false;
		}

		const testFace = faces[index];
		const sharedVertices = testFace.filter((vertice) => face.includes(vertice));

		return sharedVertices.length === 2;
	});
};

module.exports.getPrecedingIndices = getPrecedingIndices;

module.exports.getLanguageMap = async ({team, contest} = {}) => {
	const languageRecords = await Language.find({contest})
		.populate({
			path: 'solution',
			populate: {path: 'user'},
		})
		.exec();

	if (!languages[contest.id]) {
		return [];
	}

	const languageCells = languages[contest.id].map((language) => {
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
			const solvedTeam =
				cell.record &&
				cell.record.solution &&
				cell.record.solution.user.getTeam(contest);

			if (contest.isEnded()) {
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
