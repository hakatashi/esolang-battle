const Discord = require('discord.js');

const client = new Discord.Client();

const readyPromise = new Promise((resolve) => {
	client.on('ready', () => {
		resolve();
	});
});

if (process.env.DISCORD_TOKEN) {
	client.login(process.env.DISCORD_TOKEN);
}

module.exports.send = async (...args) => {
	await readyPromise;
	return client.channels.cache.get(process.env.DISCORD_CHANNEL).send(...args);
        //return null;
};
