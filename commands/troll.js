const fs = require("fs");
const ytdl = require("ytdl-core");
const opus = require('node-opus');
const Discord = require("discord.js")

var memes = JSON.parse(fs.readFileSync("./data/memes.json", "utf8"));

module.exports = {
  name: "troll",
  description: "Trolling with memes meme",
  exec(msg, args)
  {
    if(args < 2)
    {
      msg.channel.send("❌ You have to specify a meme");
      return;
    }

    if(args[1] === "stop")
    {
      if(msg.member.voice.channel) msg.member.voice.channel.leave();
      return;
    }
    else if(args[1] === "list")
    {
      var embed = new Discord.MessageEmbed()
      .setColor("#CE3142")
      .setTitle("😂 Troll meme list");
      
      var embedString = "";
      for(var meme of memes)
      {
        embedString += "\n" + meme.name;
      }

      embedString = embedString.substr(0, embedString.length);
      embed.addField("Memes", embedString);
      msg.channel.send(embed);
      return;
    }
    else if(args[1] === "rand")
    {
      args[1] = memes[Math.floor(Math.random() * Math.floor(memes.length))].name;
      msg.channel.send("🎲 Your Meme: \"" + args[1] + "\"");
    }

    if(!memes.find(meme => meme.name == args[1]))
    {
      msg.channel.send("❌ Meme not found");
      return;
    }

    var user = msg.member;
    if(args.length > 2) user = msg.mentions.members.first();

    var voiceChannel = user.voice.channel;
    if(voiceChannel)
    {
      voiceChannel.join().then(connection =>
      {
        const dispatcher = connection.play(ytdl(memes.find(meme => meme.name == args[1]).url, { filter: 'audioonly' }));
        dispatcher.setVolume(0.25);
        dispatcher.on("finish", end => {
          voiceChannel.leave();
        });
      }).catch(err => console.log(err));
    }
    else
    {
      msg.channel.send("❌ " + user.toString() + " has to be in Voice Channel")
    }
  }
}