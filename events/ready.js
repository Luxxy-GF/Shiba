const Discord = require("discord.js");
const fs = require("fs");

module.exports = {
  name: "ready",
  once: true,
  run: async function (client) {
   await client.user.setActivity(`${client.guilds.cache.size} servers`,{type: "WATCHING"})
   require("child_process").exec("git push");
    client.music.init(client.user.id);
    console.log(`${client.user.username} is now online.`);
    client.slashes = new Discord.Collection();
    const commands = fs
      .readdirSync(`${__dirname}/../commands-slash`)
      .filter((comd) => comd.endsWith(".js"));
    //Makes sure there are commands so it doesn't error
    if (commands.length) {
      commands.forEach((command) => {
        const cmd = require(`${__dirname}/../commands-slash/${command}`);

        if (!cmd.name || !cmd.description || !cmd.run) return;
        client.application?.commands.create(cmd);
        client.guilds.cache.get("849131192275566613").commands.create(cmd);
        client.slashes.set(cmd.name, cmd);
      });
    }
  },
};
