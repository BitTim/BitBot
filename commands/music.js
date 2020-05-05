const Discord = require("discord.js");
const fs = require("fs");
const ytdl = require("ytdl-core");
const opus = require('node-opus');

var memes = JSON.parse(fs.readFileSync("./data/memes.json", "utf8"));
var blacklist = JSON.parse(fs.readFileSync("./data/blacklist.json", "utf8"));
var musicRunning = false;

module.exports = {
  name: "music",
  description: "Plays music specified by URL",
  exec(msg, args)
  {
    memes = JSON.parse(fs.readFileSync("./data/memes.json", "utf8"));
    blacklist = JSON.parse(fs.readFileSync("./data/blacklist.json", "utf8"));
    var embed = new Discord.MessageEmbed().setColor("#CE3142");

    if(msg.member.guild.id != "694503221804138596")
    {
      embed.setTitle("⚠ This is a feature exclusive to Bit Inc!");
      embed.setDescription("You can join Bit Inc with the link above")
      embed.setURL("https://discord.gg/M5tysbt");
      msg.channel.send(embed);
      return;
    }

    if(args.length < 2)
    {
      embed.setTitle("❌ You have to specify an operation");
      msg.channel.send(embed);
      return;
    }

    if(musicRunning)
    {
      embed.setTitle("⌛ Please wait until the previous instance is done running");
      msg.channel.send(embed);
      return;
    }

    musicRunning = true;

    if(args[1] === "play")
    {
      if(args.length < 3)
      {
        embed.setTitle("❌ You have to specify an URL");
        msg.channel.send(embed);
        musicRunning = false;
        return;
      }

      if(!args[2].includes("https://www.youtube.com/watch?v="))
      {
        embed.setTitle("❌ You have to specify a valid YouTube URL");
        msg.channel.send(embed);
        musicRunning = false;
        return;
      }

      if(blacklist.includes(args[2]))
      {
        embed.setTitle("❌ This song is Blacklisted");
        msg.channel.send(embed);
        musicRunning = false;
        return;
      }

      var memeFound = false;
      var meme;
      for(var category of memes)
      {
        if(meme = category.items.find(m => m.url === args[2]))
        {
          memeFound = true;
          break;
        }
      }

      if(memeFound)
      {
        embed.setTitle("❌ You are not allowed to bypass the troll system. Use \"=troll " + meme.name + "\" instead");
        msg.channel.send(embed);
        musicRunning = false;
        return;
      }

      var voiceChannel = msg.member.voice.channel;
      if(voiceChannel)
      {
        voiceChannel.join().then(connection =>
        {
          const dispatcher = connection.play(ytdl(args[2], { filter: 'audioonly' }));
          dispatcher.setVolume(0.5);
          dispatcher.on("finish", end => {
            voiceChannel.leave();
	          musicRunning = false;
          });
        }).catch(err => console.log(err));
       }
      else
      {
        embed.setTitle("❌ You have to be in a Voice Channel")
        msg.channel.send(embed);
        trollRunning = false;
      }
    }
    else if(args[1] === "stop")
    {
      if(msg.member.voice.channel) msg.member.voice.channel.leave();
      musicRunning = false;
      return;
    }
    else
    {
      embed.setTitle("❌ You have to specify a valid operation (play, stop)");
      msg.channel.send(embed);
      musicRunning = false;
      return;
    }

    setTimeout(() => {
      musicRunning = false;
    }, 30000);
  }
}