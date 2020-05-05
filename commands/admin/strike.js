const Discord = require("discord.js");
const fs = require("fs");

var db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));
var strikes = JSON.parse(fs.readFileSync("./data/strikes.json", "utf8"));

module.exports = {
  name: "strike",
  description: "Issues a strike",
  async exec(msg, args)
  {
    db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));
    strikes = JSON.parse(fs.readFileSync("./data/strikes.json", "utf8"));
    var embed = new Discord.MessageEmbed().setColor("#CE3142");

    if(!args[2])
    {
      embed.setTitle("❌ You have to mention a user to strike");
      msg.channel.send(embed);
      return;
    }

    if(args[2] == "list")
    {
      embed.setTitle("📋 List of strike types");

      var nameString = "";
      var descString = "";
      var penaltyString = "";

      for(strike of strikes)
      {
        nameString += strike.name + "\n";
        descString += strike.desc + "\n";
        penaltyString += strike.penalty + "\n";
      }

      embed.addField("Name", nameString, true);
      embed.addField("Description", descString, true);
      embed.addField("Penalty", penaltyString, true);

      msg.channel.send(embed);
      return;
    }

    var user = msg.mentions.members.first();
    if(!user)
    {
      embed.setTitle("❌ You have to mention a user to strike");
      msg.channel.send(embed);
      return;
    }

    if(!db.find(u => u.id === user.id))
    {
      embed.setTitle("❌ User not found in records. Use =bits bal <user> to create a record");
      msg.channel.send(embed);
      return;
    }

    if(!args[3])
    {
      embed.setTitle("❌ You have to specify a type of strike");
      msg.channel.send(embed);
      return;
    }

    if(args[3] === "list")
    {
      embed.setTitle("⚡ Strikes of " + user.user.username);
      embed.addField("Strike points", db.find(u => u.id === user.id).strikes, true);
      embed.addField("Times imprisoned", db.find(u => u.id === user.id).prison, true);
      msg.channel.send(embed);
      return;
    }

    if(!strikes.find(s => s.name === args[3]))
    {
      embed.setTitle("❌ \"" + args[3] + "\" is not a valid reason to strike");
      msg.channel.send(embed);
      return;
    }

    var strike = strikes.find(s => s.name === args[3]);
    db.find(u => u.id === user.id).strikes += strike.penalty;

    fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });

    embed.setTitle("🚨 You have been struck!");
    embed.setDescription("You have been struck for " + args[3] + " and received a penalty of " + strike.penalty + " strike points, current total: " + db.find(u => u.id === user.id).strikes);
    await user.send(embed);

    embed.setTitle("🚨 Strike successful");
    embed.setDescription(user.user.username + " has been struck for " + args[3] + " and received a penalty of " + strike.penalty + " strike points, current total: " + db.find(u => u.id === user.id).strikes);
    msg.channel.send(embed);
  }
}