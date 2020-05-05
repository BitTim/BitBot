const Discord = require("discord.js");
const fs = require("fs");

var roles = JSON.parse(fs.readFileSync("./data/roles.json", "utf8"));
var db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

module.exports = {
  name: "role",
  description: "Assigns / Removes roles",
  exec(msg, args)
  {
    roles = JSON.parse(fs.readFileSync("./data/roles.json", "utf8"));
    db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

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

    if(args[1] === "list")
    {
      embed.setTitle("📋 List of Roles");
      
      var embedString = ""
      for(var r of roles)
      {
        if(!r.joinable) embedString += "⚠ ";
        else embedString += "✉ ";
        embedString += r.name + "\n";
      }

      embed.addField("Roles", embedString);
      embed.setFooter("⚠ <- You cannot join these roles by yourself. They are here to keep track of role IDs");
      msg.channel.send(embed);
      return;
    }

    if(args.length < 3)
    {
      embed.setTitle("❌ You have to specify an operation and a rank");
      msg.channel.send(embed);
      return;
    }

    var role = roles.find(r => r.name === args[2].toLowerCase());

    if(!role)
    {
      embed.setTitle("❌ Role \"" + args[2] + "\" not found");
      msg.channel.send(embed);
      return;
    }

    if(!role.joinable)
    {
      embed.setTitle("❌ You cannot join this role");
      msg.channel.send(embed);
      return;
    }

    if(!db.find(user => user.id === msg.author.id))
    {
      var user = {id: msg.author.id, bits: 10, strikes: 0, prison: 0, isInPrison: false, roles: ["member"], trolls: ["lmao"]}
      db.push(user);
    }

    if(args[1] === "join")
    {
      if(args.length < 3)
      {
        embed.setTitle("❌ You have to specify a role");
        msg.channel.send(embed);
        return;
      }

      if(msg.member.roles.cache.find(r => r.id === role.id))
      {
        embed.setTitle("❌ You are already in the \"" + args[2] + "\" Role");
        msg.channel.send(embed);
        return;
      }

      msg.member.roles.add(msg.member.guild.roles.cache.find(r => r.id === role.id));
      db.find(user => user.id === msg.author.id).roles.push(msg.member.guild.roles.cache.find(r => r.id === role.id));
      embed.setTitle("✅ Successfully added to the \"" + args[2] + "\" Role");
    }
    else if(args[1] === "leave")
    {
      if(args.length < 3)
      {
        embed.setTitle("❌ You have to specify a role");
        msg.channel.send(embed);
        return;
      }

      if(!msg.member.roles.cache.find(r => r.id === role.id))
      {
        embed.setTitle("❌ You are not in the \"" + args[2] + "\" Role");
        msg.channel.send(embed);
        return;
      }

      msg.member.roles.remove(role.id);
      db.find(user => user.id === msg.author.id).roles.remove(msg.member.guild.roles.cache.find(r => r.id === role.id));
      embed.setTitle("✅ Successfully removed from the \"" + args[2] + "\" Role");
    }
    else
    {
      embed.setTitle("❌ Operation not found");
    }

    msg.channel.send(embed);
  }
}
