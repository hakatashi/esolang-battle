const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		email: {type: String, unique: true},
		twitter: String,
		tokens: Array,
		team: [
			{
				contest: {type: mongoose.Schema.Types.ObjectId, ref: 'Contest'},
				value: {type: Number, enum: [0, 1, 2, 3, 4]},
			},
		],
		admin: {type: Boolean, default: false},

		profile: {
			name: String,
			gender: String,
			location: String,
			website: String,
			picture: String,
		},
	},
	{timestamps: true},
);

userSchema.methods.name = function() {
	return `@${this.email.replace(/@.+$/, '')}`;
};

userSchema.methods.getTeam = function(contest) {
	if (!this.team) {
		return null;
	}

	const teamInfo = this.team.find((team) => team.contest.equals(contest._id));
	if (!teamInfo) {
		return null;
	}

	return teamInfo.value;
};

userSchema.methods.setTeam = function(contest, newTeam) {
	console.log(this.team);
	this.team = this.team || [];

	if (this.team.some((team) => team.contest.equals(contest._id))) {
		this.team = this.team.map((team) => {
			if (team.contest.equals(contest._id)) {
				team.value = newTeam;
			}
			return team;
		});
	} else {
		this.team.push({contest, value: newTeam});
	}
	console.log(this.team);
};

/*
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function(size = 200) {
	if (!this.email) {
		return `https://gravatar.com/avatar/?s=${size}&d=retro`;
	}
	const md5 = crypto
		.createHash('md5')
		.update(this.email)
		.digest('hex');
	return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
