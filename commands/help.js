const Discord = require("discord.js");

module.exports = {
  name: "help",
  description: "Shows command list",
  exec(msg, args)
  {
    const embed = new Discord.MessageEmbed()
    .setColor("#CE3142")
    .addField("Commands", "info\nrand\nwordstat\ntroll", true)
    .addField("Description", "Shows info about the Bot\nPicks a random Item from a specified list\nShows top 10 most used words\nTrolls poeple :)))", true);
    msg.channel.send(embed);
  }
}