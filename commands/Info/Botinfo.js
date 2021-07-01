const {
  Client,
  Message,
  MessageEmbed,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "bot-info",
  aliases: ["botinfo", "info", "shiba", "bot"],
  category: `Info`,
  description: `Get info on the bot.`,
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  run: async (client, message, args) => {
    let memberc = 0;
    client.guilds.cache.forEach((guild) => (memberc += guild.memberCount));
    const embed = new MessageEmbed()
      .setAuthor(`Shiba Bot Info`, client.user.displayAvatarURL())
      .addFields(
        {
          name: `Tag <:tag:854460951805296640>`,
          value: `\`\`\`${client.user.tag}\`\`\``,
          inline: true,
        },
        {
          name: `Ping <:ping:854461197720748032>`,
          value: `\`\`\`${ms(client.ws.ping)}\`\`\``,
          inline: true,
        },
        {
          name: `Uptime <:uptime:854464688490020875>`,
          value: `\`\`\`${ms(client.uptime, { long: true })}\`\`\``,
          //   inline: true
        },
        {
          name: `Users <:users:854458687547899934>`,
          value: `\`\`\`${memberc}\`\`\``,
          inline: true,
        },
        {
          name: `Channels <:channel:854458888131444776>`,
          value: `\`\`\`${client.channels.cache.size}\`\`\``,
          inline: true,
        },
        {
          name: `Voice <:music:855134047205720104>`,
          value: `\`\`\`${client.music.players.size}\`\`\``,
          inline: true
        },
        {
          name: `Guilds <:guilds:854459430733479967>`,
          value: `\`\`\`${client.guilds.cache.size}\`\`\``,
          inline: true
        }
      )
      .setColor("RANDOM")
      .setFooter(message.author.tag, message.author.displayAvatarURL())
      .setTimestamp();

    const buttons = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel("Invite")
        .setURL(
         client.generateInvite({ permissions: ["ADMINISTRATOR"],additionalScopes: ["applications.commands"]})
        )
        .setStyle("LINK")
        .setEmoji("<:support:854951274423910410>"),

      new MessageButton()
        .setLabel("Support")
        .setURL("https://discord.gg/K4cMecMQyp")
        .setStyle("LINK")
        .setEmoji("<:invite:854951126025240586>"),
      new MessageButton()
        .setLabel("GitHub Repository")
        .setURL("https://github.com/nahann/Shiba")
        .setStyle("LINK")
        .setEmoji("<:github:854957408585515019>"),
     new MessageButton()
        .setLabel("Vote for us on top.gg")
        .setURL("https://top.gg/bot/838254815225970739")
        .setStyle("LINK")
        .setEmoji("<:rocket:856565446878560276>")
    );

    message.reply({
      embeds: [embed],
      components: [buttons],
      allowedMentions: { repliedUser: false },
    });
  },
};
