const fs = require("fs")
const Discord = require("discord.js")
const bot = new Discord.Client()

console.log("Getting Token")
const token = fs.readFileSync("token.txt", "utf8").split("\n")[0]

const PREFIX = '='
const replies = ["No.", "I don't want to", "Do I really have to say that?", "Nope", "I hate you"]

bot.on("ready", () => {
	console.log("Bot started")
})

bot.on("message", msg=> {
	console.log("Received: " + msg.content)
	let data = msg.content.substr(PREFIX.length).split(" ")

	if(data[0] === "say") 
	{
		let i = Math.floor(Math.random() * Math.floor(replies.length))
		msg.channel.send(replies[i])
	}
})

console.log("Logging in")
bot.login(token)
