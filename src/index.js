const Discord = require("discord.js"),
  client = new Discord.Client({
    ws: { properties: { $browser: "Discord iOS" } },
    intents: require("discord.js").Intents.ALL,
    allowedMentions: {
      repliedUser: false,
      parse: ["users", "roles"],
    },
  }),
  config = require("./config.json"),
  fs = require("node:fs"),
  mongoose = require("mongoose"),
  { Database } = require("zapmongo");

mongoose
  .connect(config.mongouri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database.");
  });

client.db = new Database({
  mongoURI: config.mongouri,
  schemas: [
    {
      name: "userEcos",
      data: {
        userId: String,
        walletShibaToken: {
          type: Number,
          default: 500,
        },
        bankShibaToken: {
          type: Number,
          default: 0,
        },
        Passive: {
          type: Boolean,
          default: false,
        },
      },
    },
  ],
});
client.cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();
client.loadCommands = function () {
  const commandFolders = fs.readdirSync(`${__dirname}/commands`);
  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(`${__dirname}/${folder}`)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const command = require(`${__dirname}/${folder}/${file}`);
      if (!command.category) command.category = folder;
      client.commands.set(command.name, command);
    }
  }
};
client.loadEvents = function () {
  const eventFiles = fs
    .readdirSync(`${__dirname}/events`)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const event = require(`${__dirname}/events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.run(...args, client));
    } else {
      client.on(event.name, (...args) => event.run(...args, client));
    }
  }
};
client.loadEvents();
client.loadCommands();
client.embed = (options, message) => {
  const emb = new Discord.MessageEmbed({ ...options, color: "RANDOM" })
    .setFooter(
      `${message.author.tag}`,
      message.author.displayAvatarURL({ dynamic: true, format: "png" })
    )
    .setTimestamp();
  if (options.colors && Array.isArray(options.colors))
    emb.setColor(
      options.colors[Math.floor(Math.random() * options.colors.length)]
    );

  return emb;
};

client.login(config.token);
