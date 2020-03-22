const fs = require("fs")
const wordstat = require("./wordstat.js")
const Discord = require("discord.js")
const bot = new Discord.Client()

console.log("Getting Token")
const token = fs.readFileSync("data/token.txt", "utf8").split("\n")[0]

var PREFIX = fs.readFileSync("data/prefix.txt", "utf8").split("\n")[0]
const VERSION = "v1.0.2"
const replies = ["No.", "I don't want to", "Do I really have to say that?", "Nope", "I hate you"]

bot.on("ready", () => {
	console.log("Bot started")
})

bot.on("message", msg=> {
	if(msg.author.bot) return;
	console.log("Received: " + msg.content)
	let data = msg.content.split(" ")

	switch(data[0])
	{
	case PREFIX + "say":
		let i = Math.floor(Math.random() * Math.floor(replies.length))
		msg.channel.send(replies[i])
		break


	case PREFIX + "wordstat":
		if(!data[1]) data[1] = 10
		if(data[1] > 250) data[1] = 250
		let stat = wordstat.getStat(data[1])
		if(stat == "[]") msg.channel.send("No words tracked yet")
		else
		{
			var embed = new Discord.MessageEmbed()
			.setColor("#CE3142")
			.setTitle("Top " + data[1] + " most used Words:")
			
			for(var n = 0; n < data[1]; n += 10)
			{
				var tmpStr = ""
				for(var m = 0; m < 10; m++)
				{
					if(n + m >= stat.length) break
					tmpStr += (n + m + 1) + ". " + stat[n + m].word + " (" + stat[n + m].amount + "x)\n"
				}

				if(n >= stat.length) break
				embed.addField("Places " + (n + 1) + " to " + (n + 10), tmpStr, true)
			}

			msg.channel.send(embed)
		}
		break


	case PREFIX + "info":
		if(data[1] == "version") msg.channel.send("Version: " + VERSION);
		break


	case PREFIX + "changePrefix":
		if(!data[1])
		{
			msg.reply("Please specify a new Prefix")
			break
		}

		PREFIX = data[1];
		msg.reply("Changed prefix to: " + PREFIX)
		
		fs.writeFile("data/prefix.txt", PREFIX, (err) => {if (err) throw err})
		console.log("Changed prefix to: " + PREFIX)
		break


	default:
		if(msg.content.includes("Current Word Count Status:"))
		console.log("Beginning to track: " + msg.content)
		wordstat.update(msg.content)
		break
	}
})

console.log("Logging in")
bot.login(token)
