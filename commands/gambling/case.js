const Discord = require("discord.js")
const fs = require("fs")

var memes = JSON.parse(fs.readFileSync("./data/memes.json", "utf8"));
var cases = JSON.parse(fs.readFileSync("./data/cases.json", "utf8"));
var db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

var doneOpen = true;

module.exports = {
  name: "case",
  description: "A CS:GO like case opening game",
  async exec(msg, args)
  {
    db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));
    var embed = new Discord.MessageEmbed().setColor("#CE3142")

    if(!doneOpen)
    {
      embed.setTitle("⏳ Please wait until the previous instance finished");
      msg.channel.send(embed);
      return;
    }

    doneOpen = false;

    if(!args[2])
    {
      embed.setTitle("❌ You have to specify a case to open");
      msg.channel.send(embed);
      return;
    }

    if(args[2] === "list")
    {
      embed.setTitle("💼 List of cases");
      embed.addField("Case name", `
      germany
      music
      clip-1
      `, true);
      embed.addField("Case contents", `
      1 Bit, wow2, erdbeermarmelade, jaaa, indertat, pcspielen
      3 Bits, bruhbruh, faces, nyan, sandstorm, mine
      2 Bits, wow, omg, nice, nonono, nani
      `, true);
      embed.addField("Notes", `
      If you open a case, you will only get one of the outcomes
      Outcomes are sorted from common to rare
      `);
      msg.channel.send(embed);
      return;
    }

    if(!cases.find(item => item.name === args[2]))
    {
      embed.setTitle("❌ Case \"" + args[2] + "\" not found");
      msg.channel.send(embed);
      return;
    }

    var selCase = cases.find(item => item.name === args[2]);

    if(db.find(user => user.id === msg.author.id).bits < selCase.price)
    {
      embed.setTitle("❌ Insufficient funds");
      msg.channel.send(embed);
      return;
    }

    if(db.find(user => user.id === msg.author.id).bits < 0)
    {
      embed.setTitle("⚠ Warning, you are using the Bits from your loan");
      msg.channel.send(embed);
    }

    db.find(user => user.id === msg.author.id).bits -= selCase.price;
    embed.setTitle("💼 Case Opening (" + msg.author.username + ")");
    embed.addField("Outcome", "⚙ Opening", true)
    embed.addField("Payment", "💳 You have paid " + selCase.price + " Bits", true)
    embed.addField("Change in balance", (db.find(user => user.id === msg.author.id).bits + selCase.price) + " Bits > " + db.find(user => user.id === msg.author.id).bits + " Bits", true)
    var sent = await msg.channel.send(embed);

    var rand = Math.floor(Math.random() * Math.floor(100));
    var outcome;
    
    var totalProb = 0;
    for(var i = 0; i < selCase.outcomes.length; i++)
    {
      if(rand >= totalProb && rand < totalProb + selCase.outcomes[i].probability)
      {
        outcome = selCase.outcomes[i];
        break;
      }

      totalProb += selCase.outcomes[i].probability;
    }

    var counter = 0;
    var interval = setInterval(() => {
      embed.fields[0].value += ".";
      
      sent.edit(embed).then(() =>
      {
        if(++counter >= 3)
        {
          clearInterval(interval);

          if(outcome.name.includes("---bit"))
          {
            var amount = Number(outcome.name.split("-")[0])

            embed.fields[0] = {name: "Outcome", value: "💰 You won " + amount + " Bits!", inline: true};
            embed.fields[2].value += "\n" + db.find(user => user.id === msg.author.id).bits + " Bits > " + (db.find(user => user.id === msg.author.id).bits + amount) + " Bits";
            db.find(user => user.id === msg.author.id).bits += amount;
          }
          else
          {
            embed.fields[0] = {name: "Outcome", value: "💎 You won \"" + outcome.name + "\"!", inline: true};
            if(db.find(user => user.id === msg.author.id).trolls.includes(outcome.name))
            {            
              var itemFound = false;
              var item;

              for(var category of memes)
              {
                if(item = category.items.find(meme => meme.name === outcome.name))
                {
                  itemFound = true;
                  break;
                }
                if(itemFound) break;
              }

              embed.addField("Notes", "You already own this item. You will get it's value (" + item.price + ") in Bits instead");
              embed.fields[2].value += "\n" + db.find(user => user.id === msg.author.id).bits + " Bits > " + (db.find(user => user.id === msg.author.id).bits + item.price) + " Bits";
              db.find(user => user.id === msg.author.id).bits += item.price;
            }
            else
            {
              db.find(user => user.id === msg.author.id).trolls.push(outcome.name);
            }
          }

          sent.edit(embed);
          fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
          doneOpen = true;
        }
      })
    }, 1000);
  }
}
