const Discord = require("discord.js")

module.exports = {
  name: "timeout",
  description: "Timeouts Admins/Mods",
  exec(msg, args)
  {
    const embed = new Discord.MessageEmbed().setColor("#CE3142")
    .setTitle("🎰 Gambling games")
    .addField("Games", `
    slot
    case
    blackjack
    `, true)
    .addField("Descriptions", `
    A slot machine style game
    A CS:GO like case opening game
    A Blackjack game
    `, true);
    msg.channel.send(embed);
  }
}