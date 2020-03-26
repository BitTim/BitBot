const Discord = require("discord.js")

module.exports = {
  name: "rand",
  description: "Picks a random item from a list",
  exec(msg, args)
  {
    args.splice(0, 1);
    var list = args.join(" ");
    list = list.split(",");

    for(var i = 0; i < list.length; i++) if(list[i].substr(0, 1) === " ") list[i] = list[i].substr(1);

    const embed = new Discord.MessageEmbed()
    .setColor("#CE3142");

    if(list.length === 0)
    {
      embed.setTitle("❌ You have to specify a comma seperated list of items")
    }
    else
    {
      var rand = Math.floor(Math.random() * Math.floor(list.length));
      embed.setTitle("🎲 Your item: \"" + list[rand] + "\"");
    }

    msg.channel.send(embed);
  }
}