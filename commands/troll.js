const fs = require("fs");
const ytdl = require("ytdl-core");
const opus = require('node-opus');
const Discord = require("discord.js")

var memes = JSON.parse(fs.readFileSync("./data/memes.json", "utf8"));
var db = JSON.parse(fs.readFileSync("data/users.json", "utf8"));

module.exports = {
  name: "troll",
  description: "Trolling with memes meme",
  exec(msg, args)
  {
    db = JSON.parse(fs.readFileSync("data/users.json", "utf8"));
    
    var embed = new Discord.MessageEmbed()
    .setColor("#CE3142")

    if(args < 2)
    {
      embed.setTitle("❌ You have to specify a meme");
      msg.channel.send(embed)
      return;
    }

    if(args[1] === "stop")
    {
      if(msg.member.voice.channel) msg.member.voice.channel.leave();
      return;
    }
    else if(args[1] === "list")
    {
      embed.setTitle("😂 Troll meme list");

      for(var category of memes)
      {
        var embedString = "";
        for(var item of category.items)
        {
          if(db.find(user => user.id === msg.author.id).trolls.includes(item.name))
          {
            embedString += "✅ ";
          }
          else embedString += "❌ ";

          embedString += item.name + "\n";
        }

        embed.addField(category.name, embedString, true);
      }

      embed.addField("Notes", "Indicators show which ones " + msg.author.username + " owns");

      msg.channel.send(embed);
      return;
    }
    else if(args[1] === "rand")
    {
      args[1] = db.find(user => user.id === msg.author.id).trolls[Math.floor(Math.random() * Math.floor(db.find(user => user.id === msg.author.id).trolls.length))];
      embed.setTitle("🎲 Your Meme: \"" + args[1] + "\"");
      msg.channel.send(embed);
    }

    var memeFound = false;
    var meme;
    for(var category of memes)
    {
      if(meme = category.items.find(meme => meme.name == args[1]))
      {
        memeFound = true;
        break;
      }
    }

    if(!memeFound)
    {
      embed.setTitle("❌ Meme not found");
      msg.channel.send(embed);
      return;
    }

    if(!db.find(user => user.id === msg.author.id).trolls.includes(args[1]))
    {
      embed.setTitle("❌ You don't have " + args[1] + " unlocked yet");
      msg.channel.send(embed);
      return;
    }

    var user = msg.member;
    if(args.length > 2) user = msg.mentions.members.first();

    var voiceChannel = user.voice.channel;
    if(voiceChannel)
    {
      voiceChannel.join().then(connection =>
      {
        const dispatcher = connection.play(ytdl(meme.url, { filter: 'audioonly' }));
        dispatcher.setVolume(0.5);
        dispatcher.on("finish", end => {
          voiceChannel.leave();
        });
      }).catch(err => console.log(err));
    }
    else
    {
      embed.setTitle("❌ " + user.user.username + " has to be in Voice Channel")
      msg.channel.send(embed);
    }
  }
}