const Discord = require("discord.js")
const fs = require("fs")

const bitTimID = "398134358575153154";
const botID = "691058683681177700";
var db = JSON.parse(fs.readFileSync("data/users.json", "utf8"));

module.exports = {
  name: "bits",
  description: "Operations with bits",
  exec(msg, args)
  {
    db = JSON.parse(fs.readFileSync("data/users.json", "utf8"));
    
    var embed = new Discord.MessageEmbed().setColor("#CE3142")
    if(args.length < 2) args.push("bal");
    if(args[1] === "bal")
    {
      var id = msg.author.id;
      if(args.length > 2) id = msg.mentions.members.first().id;

      if(db.find(user => user.id === id))
        embed.setTitle("💸 " + msg.guild.members.cache.get(id).user.username + "'s Balance is: " + db.find(user => user.id === id).bits + " Bits")
      else
      {
        var user = {id: id, bits: 10, trolls: ["lmao"]}
        db.push(user);
        embed.setTitle("💸 Your Balance is: " + db.find(user => user.id === id).bits + " Bits")
      
        fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
      }
    }
    else if(args[1] === "add")
    {
      if(msg.mentions.members.first().id === botID)
      {
        embed.setTitle("❌ You cannot create a Bit wallet for me 😛");
        msg.channel.send(embed)
        return;
      }

      if(msg.author.id === bitTimID)
      {
        if(args.length < 4) embed.setTitle("❌ You need to specify an amount and a recipiant");
        else
        {
          db.find(user => user.id === msg.mentions.members.first().id).bits += Number(args[3]);
          fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
          embed.setTitle("💰 Added " + args[3] + " Bits to the balance of " + msg.mentions.members.first().user.username);
        }
      }
      else embed.setTitle("❌ Insufficient Permission");
    }
    else if(args[1] === "del")
    {
      if(msg.author.id === bitTimID)
      {
        if(msg.mentions.members.first().id === botID)
        {
          embed.setTitle("❌ I do not own Bits!");
          msg.channel.send(embed)
          return;
        }

        if(args.length < 4) embed.setTitle("❌ You need to specify an amount and a recipiant");
        else
        {
          var bal = db.find(user => user.id === msg.mentions.members.first().id).bits;
          db.find(user => user.id === msg.mentions.members.first().id).bits = Number(bal) - Number(args[3]);
          if(db.find(user => user.id === msg.mentions.members.first().id).bits < 0) db.find(user => user.id === msg.mentions.members.first().id).bits = 0;
          fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
          embed.setTitle("💰 Removed " + args[3] + " Bits to the balance of " + msg.mentions.members.first().user.username);
        }
      }
      else embed.setTitle("❌ Insufficient Permission");
    }
    else if(args[1] === "give")
    {
      if(args.length < 4 || !msg.mentions.members.first())
      {
        embed.setTitle("❌ You need to specify an amount and a recipiant");
        msg.channel.send(embed)
        return;
      }

      if(msg.mentions.members.first().id === botID)
      {
        embed.setTitle("❌ You cannot send Bits to me, but still thanks 😊");
        msg.channel.send(embed)
        return;
      }

      if(args[3] < 0)
      {
        embed.setTitle("❌ Hey, you can not steal!");
        msg.channel.send(embed);
        return;
      }

      if(msg.mentions.members.first().id === msg.author.id)
      {
        embed.setTitle("❌ Why would you send money to yourself?");
        msg.channel.send(embed);
        return;
      }

      if(!db.find(user => user.id === msg.author.id))
      {
        var user = {id: msg.author.id, bits: 10, trolls: ["lmao"]}
        db.push(user);
        fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
      }

      if(db.find(user => user.id === msg.author.id).bits >= args[3])
      {
        var bal1 = db.find(user => user.id === msg.author.id).bits;
        var bal2 = db.find(user => user.id === msg.mentions.members.first().id).bits;
        
        db.find(user => user.id === msg.author.id).bits = Number(bal1) - Number(args[3]);
        db.find(user => user.id === msg.mentions.members.first().id).bits = Number(bal2) + Number(args[3]);
        
        fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
        embed.setTitle("💰 Transferred " + args[3] + " Bits to " + msg.mentions.members.first().user.username);
      }
      else
      {
        embed.setTitle("❌ Insufficient Funds");
      }
    }

    msg.channel.send(embed)
  }
}