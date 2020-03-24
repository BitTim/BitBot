const ytdl = require("ytdl-core");
const opus = require('node-opus');
const Discord = require("discord.js")

module.exports = {
  name: "egal",
  description: "Egal meme",
  exec(msg, args)
  {
    var user = msg.member;
    if(args.length > 1) user = msg.mentions.members.first();

    var voiceChannel = user.voice.channel;
    if(voiceChannel)
    {
      voiceChannel.join().then(connection =>
      {
        const dispatcher = connection.play(ytdl('https://www.youtube.com/watch?v=Vu7bzI2Hms0', { filter: 'audioonly' }));
        dispatcher.on("finish", end => {
          voiceChannel.leave();
        });
      }).catch(err => console.log(err));
    }
    else
    {
      const embed = new Discord.MessageEmbed()
      .setColor("#CE3142")
      .setTitle("❌ <@" + user.id + "> has to be in Voice Channel");
      //msg.channel.send(embed);
      msg.channel.send("❌ " + user.toString() + " has to be in Voice Channel")
    }
  }
}