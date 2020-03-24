const VERSION = "1.0.4";
const dateStarted = new Date();

const Discord = require("discord.js");

module.exports = {
  name: "info",
  description: "Gives info about the Bot",
  exec(msg, args)
  {
    const embed = new Discord.MessageEmbed()
    .setColor("#CE3142")
    .setTitle("ℹ Bot Info")
    .addField("Author", "BitTim")
    .addField("Version", VERSION)
    .addField("Running since", dateStarted.getDate() + "." + dateStarted.getMonth() + "." + dateStarted.getFullYear() + ", " + dateStarted.getHours() + ":" + dateStarted.getMinutes());
    msg.channel.send(embed);
  }
}