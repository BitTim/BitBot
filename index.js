const fs = require("fs");
const Discord = require("discord.js");

var db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));
const bitGroupID = "694503221804138596";

//================================
// INIT
//================================

Object.defineProperty(Array.prototype, 'flat', {
	value: function(depth = 1) {
		return this.reduce(function (flat, toFlatten) {
			return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
		}, []);
	}
});

const PREFIX = "=";

console.log("Getting Token");
const token = fs.readFileSync("./token.txt", "utf8").split("\n")[0];

console.log("Creating client");
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

console.log("Getting commands")
const commandFiles = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
for(const file of commandFiles)
{
	const command = require(`./commands/${file}`);
	console.log("-> Adding command " + command.name);
	bot.commands.set(command.name, command);
}
console.log("Creation complete")

//================================
// READY
//================================

bot.on("ready", () => {
	console.log("Bot started");
})

//================================
// UPDATE
//================================

bot.on("message", (msg) => {
	if(msg.author.bot) return;
	console.log("Received: " + msg.content);
	let data = msg.content.split(" ");

	for(var i = 0; i < data.length; i++) if(data[i] == "") data.splice(i--, 1); 
	console.log(data);

	if(!data[0]) return;

	if(data[0].substr(0, 1) === PREFIX)
	{
		data[0] = data[0].substr(1);
		if(bot.commands.get(data[0].toLowerCase()) != undefined)
		{
			console.log("Found command " + data[0].toLowerCase());
			bot.commands.get(data[0].toLowerCase()).exec(msg, data)
		}
		else if(data[0] != "")
		{
			const embed = new Discord.MessageEmbed().setColor("#CE3142")
			embed.setTitle("❌ Command \"" + data[0] + "\" is not valid");
			msg.channel.send(embed);
		}
	}
	else
	{
		if(msg.content.toLowerCase().includes("uh oh"))
		{
			msg.channel.send("BLACK PEOPLE");

			if(msg.member)
			{
				if(msg.member.voice.channel)
				{
					msg.member.voice.channel.join().then(connection =>
					{
						const dispatcher = connection.play('./data/black people.mp3');
						dispatcher.setVolume(0.5);
						dispatcher.on("finish", end => {
							msg.member.voice.channel.leave();
						});
					}).catch(err => console.log(err));
				}
			}
		}
		else if(msg.content.toLowerCase().includes("kill myself"))
		{
			msg.reply("🔫 Here you go!")
		}

		bot.commands.get("wordstat").update(msg);
	}
})

bot.on('guildMemberAdd' , member => {
	if(!member.guild.id == bitGroupID) return;

	console.log(member.user.username + " joined Bit Group")
	var role = member.guild.roles.cache.find(r => r.name === "Member");
	member.roles.add(role)
})

console.log("Logging in");
bot.login(token);

setInterval(() => {
	db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));
	fs.writeFileSync("./backup/users.json", JSON.stringify(db, null, "\t"));
}, 1800000);
