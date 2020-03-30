const Discord = require("discord.js")
const fs = require("fs")

var db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

module.exports = {
  name: "loan",
  description: "Gives the user a loan of 5 Bits, when he has none",
  async exec(msg, args)
  {
    db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

    if(db.find(user => user.id === msg.author.id).bits === 0)
    {
      const embed = new Discord.MessageEmbed().setColor("#CE3142")
      .setTitle("🏦 You have been given 5 Bits as a loan");
      await msg.channel.send(embed);

      db.find(user => user.id === msg.author.id).bits -= 5;
    }
    else
    {
      const embed = new Discord.MessageEmbed().setColor("#CE3142")
      .setTitle("❌ You still have Bits, you cannot take a loan");
      await msg.channel.send(embed);
    }

    fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
  }
}