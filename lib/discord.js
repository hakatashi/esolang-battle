const Discord = require('discord.js');
const client = new Discord.Client();

const readyPromise = new Promise((resolve) => {
	client.on('ready', () => {
		resolve();
	});
});

client.login(process.env.DISCORD_TOKEN);

module.exports.send = async (...args) => {
	await readyPromise;
	return client.channels.get(process.env.DISCORD_CHANNEL).send(...args);
};
