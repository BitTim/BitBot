const Discord = require("discord.js")

module.exports = {
  name: "list",
  description: "Lists all available games",
  exec(msg, args)
  {
    const embed = new Discord.MessageEmbed().setColor("#CE3142")
    .setTitle("🎰 Gambling games")
    .addField("Games", `
    slot
    case
    `, true)
    .addField("Descriptions", `
    A slot machine style game
    A CS:GO like case opening game
    `, true);
    msg.channel.send(embed);
  }
}