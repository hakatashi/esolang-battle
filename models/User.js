const bcrypt = require('bcrypt-nodejs');
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
				value: {type: Number, enum: [0, 1, 2]},
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
	{timestamps: true}
);

/*
 * Password hash middleware.
 */
userSchema.pre('save', async function(next) {
	if (!this.isModified('password')) {
		next();
		return;
	}

	const salt = await new Promise((resolve, reject) => {
		bcrypt.genSalt(10, (error, dSalt) => {
			if (error) {
				reject(error);
			} else {
				resolve(dSalt);
			}
		});
	});

	const hash = await new Promise((resolve, reject) => {
		bcrypt.hash(this.password, salt, null, (error, dHash) => {
			if (error) {
				reject(error);
			} else {
				resolve(dHash);
			}
		});
	});

	this.password = hash;
	next();
});

/*
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
		cb(err, isMatch);
	});
};

userSchema.methods.name = function() {
	return `@${this.email.replace(/@.+$/, '')}`;
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
