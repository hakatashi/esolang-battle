// Revert Submission
// Usage: node revert.js {submission id}

const {stripIndent} = require('common-tags');
const mongoose = require('mongoose');
const docker = require('../engines/docker');
const Contest = require('../models/Contest');
const Language = require('../models/Language');
const Submission = require('../models/Submission');
const User = require('../models/User');

mongoose.Promise = global.Promise;

(async () => {
        await mongoose.connect('mongodb://localhost:27017/esolang-battle');

        await Submission.deleteOne({_id: sys.argv[2]});

        mongoose.connection.close();
})();

