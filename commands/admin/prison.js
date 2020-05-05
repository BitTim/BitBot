const Discord = require("discord.js")
const fs = require("fs");

var roles = JSON.parse(fs.readFileSync("./data/roles.json", "utf8"));
var db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

module.exports = {
  name: "prison",
  description: "Imprisons a User",
  async exec(msg, args)
  {
    const embed = new Discord.MessageEmbed().setColor("#CE3142")

    if(!args[2])
    {
      embed.setTitle("❌ You have to specify an action for imprisoning (start, end)");
      msg.channel.send(embed);
      return;
    }

    if(!args[3])
    {
      embed.setTitle("❌ You have to mention a user to imprison");
      msg.channel.send(embed);
      return;
    }

    var user = msg.mentions.members.first();

    if(!user)
    {
      embed.setTitle("❌ You have to mention a user to imprison");
      msg.channel.send(embed);
      return;
    }

    if(args[2] === "start")
    {
      await user.roles.add(roles.find(r => r.name === "prison").id);

      for(role of db.find(u => u.id === user.id).roles)
      {
        user.roles.remove(roles.find(r => r.name === role).id);
      }

      db.find(u => u.id === user.id).isInPrison = true;
      db.find(u => u.id === user.id).prison += 1;

      embed.setTitle("🚓 " + user.user.username + " has been imprisoned");
      await msg.channel.send(embed);
    }
    else if(args[2] === "end")
    {
      await user.roles.remove(roles.find(r => r.name === "prison").id);

      for(role of db.find(u => u.id === user.id).roles)
      {
        user.roles.add(roles.find(r => r.name === role).id);
      }

      db.find(u => u.id === user.id).isInPrison = false;

      embed.setTitle("🚓 " + user.user.username + " has been released from Prison");
      await msg.channel.send(embed);
    }
    else
    {
      embed.setTitle("❌ Invalid prison action");
      msg.channel.send(embed);
    }

    fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
  }
}