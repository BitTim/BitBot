const fs = require("fs")
const Discord = require("discord.js")
const bot = new Discord.Client()

console.log("Getting Token")
const token = fs.readFileSync("token.txt", "utf8").split("\n")[0]

bot.on("ready", () => {
	console.log("Bot started")
})

console.log("Logging in")
bot.login(token)
