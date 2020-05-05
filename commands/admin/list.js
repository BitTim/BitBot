const Discord = require("discord.js")

module.exports = {
  name: "list",
  description: "Lists all available actions",
  exec(msg, args)
  {
    const embed = new Discord.MessageEmbed().setColor("#CE3142")
    .setTitle("👮 Admin actions")
    .addField("Actions", `
    strike
    prison
    timeout
    `, true)
    .addField("Descriptions", `
    Gives a user a strike
    Sends user to prison
    Timeouts an Admin / Mod (BitTim only)
    `, true);
    msg.channel.send(embed);
  }
}