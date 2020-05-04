const assert = require('assert');
const contests = require('../contests');
const langInfos = require('../data/infos.json');
const languages = require('../data/languages');
const Language = require('../models/Language');

module.exports.getLanguageMap = async ({team = null, contest} = {}) => {
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
					(languageRecord) => languageRecord.slug === language.slug,
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
			const langInfo = langInfos.find(({slug}) => slug === cell.slug);

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
						link: cell.link,
						info: langInfo,
						available: false,
					};
				}

				return {
					type: 'language',
					solved: false,
					slug: cell.slug,
					name: cell.name,
					link: cell.link,
					info: langInfo,
					available: false,
				};
			}

			assert({}.hasOwnProperty.call(contests, contest.id));
			const {getPrecedingIndices} = contests[contest.id];

			const precedingCells = getPrecedingIndices(index).filter((i) => languageCells[i].type !== undefined).map(
				(i) => languageCells[i],
			);

			const available =
				typeof team === 'number' &&
				(
					contest.id === 'hackathon2018' ||
					cell.team === team ||
					solvedTeam === team ||
					precedingCells.some(
						(c) => (
							c.team === team ||
							(
								c.record &&
								c.record.solution &&
								c.record.solution.user.getTeam(contest)
							) === team
						),
					)
				);

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
					link: cell.link,
					info: langInfo,
					available,
				};
			}

			if (
				precedingCells.some(
					(c) => c.type === 'base' ||
						(c.type === 'language' && c.record && c.record.solution),
				)
			) {
				return {
					type: 'language',
					solved: false,
					slug: cell.slug,
					name: cell.name,
					link: cell.link,
					info: langInfo,
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

module.exports.getCodeLimit = (languageId) => {
	if (languageId === 'fernando') {
		return 1024 * 1024;
	}

	if (
		[
			'unlambda',
			'blc',
			'function2d',
			'brainfuck-bfi',
			'brainfuck-esotope',
			'taxi',
		].includes(languageId)
	) {
		return 100 * 1024;
	}

	return 10 * 1024;
};

module.exports.getTimeLimit = (languageId) => {
	if (
		[
			'kotlin',
			'husk',
		].includes(languageId)
	) {
		return 30 * 1000;
	}

	return 10 * 1000;
};
