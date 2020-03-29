const Discord = require("discord.js");

module.exports = {
  name: "help",
  description: "Shows command list",
  exec(msg, args)
  {
    const embed = new Discord.MessageEmbed()
    .setColor("#CE3142")
    .setTitle("⌨ List of Commands")
    .addField("Commands", `
    info
    rand [<Item 1>, <Item 2>, ...]

    wordstat
    wordstat <Amount>

    troll <Meme>
    troll <Meme> <User>
    troll list
    troll rand
    troll rand <User>
    troll stop

    bits
    bits bal
    bits bal <User>
    bits give <User> <Amount>

    gamble list
    gamble loan
    gamble <Game>
    gamble slot <Bet>
    gamble slot paytable
    gamble case list

    shop list
    shop buy <Item>
    shop buy rand`, true)
    .addField("Description", `
    Shows info about the Bot
    Picks a random Item from a specified list

    Shows top 10 most used words
    Shows top <Amount> most used words

    Plays <Meme> in current Voice Channel
    Plays <Meme> in Voice Channel <User> is in
    Lists all available memes
    Plays a random meme
    Plays a random meme in Voice Channel of <User>
    Stops playing current meme

    Displays current balance of Bits
    Displays current balance of Bits
    Displays current balance of bits of <User>
    Transfers <Amount> Bits to <User>

    Lists all available gambling games
    Gives a loan of 5 Bits for gambling only
    Playing <Game>
    Playing "slot" with a bet of <Bet> Bits
    Displays the paytable for the slot machine
    Lists all available Cases

    Lists all purchasable items
    Purchases a specified Item
    Purchases a random Item you can afford`, true)
    .addField("Notes", `
    <User> is a Mention, not a username e.g. @BitTim and not BitTim
    `);
    msg.channel.send(embed);
  }
}