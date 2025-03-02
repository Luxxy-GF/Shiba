const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const ms = require("pretty-ms");

module.exports = {
  name: "play",
  aliases: ["p"],
  description: "Play music from youtube and more.",
  run: async (client, message, args) => {
    const channel = message.member.voice.channel;
    const url = args.join(" ");

    if (!channel)
      return message.reply({
        embeds: [
          client.embed(
            { description: `You're not in a voice channel lol.` },
            message
          ),
        ],
        allowedMentions: { repliedUser: false },
      });

    if (!url)
      return message.reply({
        embeds: [
          client.embed(
            { description: `Oh you want me to play nothing lol?` },
            message
          ),
        ],
        allowedMentions: { repliedUser: false },
      });

    let player

    if (client.music.players.get(message.guild.id)) {
      player = client.music.players.get(message.guild.id)
    } else {
      player = client.music.create({
        guild: message.guild.id,
        voiceChannel: channel.id,
        textChannel: message.channel.id,
        volume: 100,
        selfDeafen: true,
      });
    }

    if (player.state !== "CONNECTED") player.connect();

    let res

    try {
      res = await player.search(url, message.author)
    } catch {
      return message.reply({
        embeds: [
          client.embed(
            { description: `Something went wrong with searching for it.` },
            message
          ),
        ],
        allowedMentions: { repliedUser: false },
      });
    }
    console.log(res.loadType)
    switch (res.loadType) {
      case "NO_MATCHES":
        if (!player.queue.current) {
          player.destroy();
          return message.reply({ embeds: client.embed({ description: `Did not find anything.`, message }) })
        }


      case "TRACK_LOADED":
        res.tracks[0].endTime = Date.now() + res.tracks[0].duration
        player.queue.add(res.tracks[0]);

        if (player.playing) return message.reply({ embeds: [client.embed({ description: `Added **${res.tracks[0].title}** to the queue`},message).setThumbnail(res.tracks[0].thumbnail)] })
        if (!player.playing && !player.paused && !player.queue.length) return player.play();

      case "PLAYLIST_LOADED":
        player.queue.add(res.tracks);
        const s = client.trimArray(res.tracks.map(s => s.title),3)
        player.queue.shuffle()
        player.play();
        return message.reply({ embeds: [client.embed({ description: `Added ${s} to the queue`},message).setThumbnail(message.author.displayAvatarURL())], message })

      case "SEARCH_RESULT":
        let max = 5

        if (res.tracks.length < max) max = res.tracks.length;
        const results = await res.tracks
          .slice(0, max)
          .map((track, index) => `**${++index}** - [${track.title}](${track.uri}) by ${track.author}`)
          .join("\n");
        const b1 = new MessageButton().setEmoji('1️⃣').setCustomId("b1").setStyle("PRIMARY")
        const b2 = new MessageButton().setEmoji('2️⃣').setCustomId("b2").setStyle("SECONDARY")
        const b3 = new MessageButton().setEmoji('3️⃣').setCustomId("b3").setStyle("SUCCESS")
        const b4 = new MessageButton().setEmoji('4️⃣').setCustomId("b4").setStyle("DANGER")
        const b5 = new MessageButton().setEmoji('5️⃣').setCustomId("b5").setStyle("PRIMARY")
        const row = new MessageActionRow().addComponents([b1,b2,b3,b4,b5])

        const msg = await message.reply({
          embeds: [client.embed({ description: results }, message)],
          components: [row]
        })


        let number

        try {
          const filter = (interaction) => interaction.user.id === message.author.id;

          await msg.awaitMessageComponent(filter, { max: 1, time: 100000, errors: ['time'] })
            .then(async(collected)=>{
              const interaction = await collected
              if (interaction.customId === 'b1') {
                number = '0'
              } else if (interaction.customId === 'b2') {
                number = '1'
              } else if (interaction.customId === 'b3') {
                number = '2'
              } else if (interaction.customId === 'b4') {
                number = '3'
              } else if (interaction.customId === 'b5') {
                number = '4'
              }
             msg.edit({embeds: msg.embeds, components: []})
             interaction.reply({content: "Successful!",ephemeral: true})
            })
        } catch (e) { console.error(e) }

        const track = res.tracks[number];
        player.queue.add(track);

        if (player.playing) return message.reply({ embeds: [client.embed({ title: `Added ${track.title} to the queue`, description: `Duration : ${ms(track.duration)}\nAuthor: **${track.author}**` }, message).setThumbnail(track.thumbnail)] })
        if (!player.playing && !player.paused && !player.queue.length) return player.play();
    }
  },
};
