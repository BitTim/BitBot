const Discord = require("discord.js")
const fs = require("fs")

var memes = JSON.parse(fs.readFileSync("./data/memes.json", "utf8"));
var db = JSON.parse(fs.readFileSync("data/users.json", "utf8"));

module.exports = {
  name: "shop",
  description: "Shop for memes",
  exec(msg, args)
  {
    db = JSON.parse(fs.readFileSync("data/users.json", "utf8"));
    
    if(args < 2)
    {
      msg.channel.send("❌ You have to specify an argument");
      return;
    }

    var embed = new Discord.MessageEmbed().setColor("#CE3142");

    if(args[1] === "list")
    {
      embed.setTitle("🛍 List of purchaseable memes");
      
      for(var category of memes)
      {
        var embedString = "";
        for(var item of category.items)
        {
          if(item.price != 0) embedString += "<" + item.price + " Bits> " + item.name + "\n";
          else embedString += "<FREE> " + item.name + "\n";
        }

        embed.addField(category.name, embedString, true);
      }
    }
    else if(args[1] === "buy")
    {
      if(args.length < 3)
      {
        embed.setTitle("❌ You have to specify an item to buy");
        msg.channel.send(embed);
        return;
      }

      if(args[2] === "rand")
      {
        var broken = false;
        for(var category of memes)
        {
          for(var item of category.items)
          {
            var randCategory = Math.floor(Math.random() * Math.floor(memes.length - 1));
            var randItem = Math.floor(Math.random() * Math.floor(memes[randCategory].items.length - 1));

            if(!db.find(user => user.id === msg.author.id).trolls.includes(memes[randCategory].items[randItem].name)
            && db.find(user => user.id === msg.author.id).bits >= memes[randCategory].items[randItem].price)
            {
              args[2] = memes[randCategory].items[randItem].name
              broken = true;
              break;
            }
          }
          if(broken) break;
        }

        if(!broken)
        {
          embed.setTitle("❌ You don't have enough Bits to buy any meme");
          msg.channel.send(embed);
          return;
        }
      }

      var itemFound = false;
      var item;
      for(var category of memes)
      {
        if(item = category.items.find(meme => meme.name === args[2]))
        {
          itemFound = true;
          break;
        }
      }

      if(!itemFound)
      {
        embed.setTitle("❌ Item \"" + args[2] + "\" not found");
        msg.channel.send(embed);
        return;
      }

      if(db.find(user => user.id === msg.author.id).trolls.includes(item.name))
      {
        embed.setTitle("❌ You already own this item");
        msg.channel.send(embed);
        return;
      }

      if(db.find(user => user.id === msg.author.id).bits < item.price)
      {
        embed.setTitle("❌ Insufficient funds");
        msg.channel.send(embed);
        return;
      }

      db.find(user => user.id === msg.author.id).trolls.push(item.name);
      db.find(user => user.id === msg.author.id).bits -= item.price;
      embed.setTitle("🛒 Successfully purchased " + item.name + " for " + item.price + " Bits!")

      fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
    }

    msg.channel.send(embed);
  }
}