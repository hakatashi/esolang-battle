const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const Language = require('../models/Language');
const docker = require('../engines/docker');
const langs = require('../data/langs.json');

require('../models/User');

mongoose.Promise = global.Promise;

(async () => {
	await mongoose.connect('mongodb://localhost:27017/esolang-battle');

	// rollback
	for (const langInfo of langs) {
		if (langInfo.disasm !== true) {
			continue;
		}

		console.log(`Disassembling ${langInfo.slug}...`);
		const languages = await Language.find({slug: langInfo.slug});

		for (const language of languages) {
			const submissions = await Submission.find({language});

			for (const submission of submissions) {
				console.log(`Disassembling submission ${submission._id}...`);
				const disasmInfo = await docker({
					id: langInfo.slug,
					code: submission.code,
					stdin: '',
					trace: false,
					disasm: true,
				});
				console.log('disasm info:', disasmInfo);

				if (typeof disasmInfo !== 'object') {
					throw new Error('disasm info is not object');
				}

				const {stdout: disasm} = disasmInfo;
				submission.disasm = disasm;
				await submission.save();
			}
		}
	}

	mongoose.connection.close();
})();
