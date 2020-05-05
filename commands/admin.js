const Discord = require("discord.js")
const fs = require("fs")

const bitTimID = "398134358575153154";
const adminID = "694503404088721419";
const moderatorID = "694503467741610010";

actions = new Discord.Collection();
var db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

console.log("-> -> Getting actions")
const adminFiles = fs.readdirSync("./commands/admin").filter(file => file.endsWith(".js"));
for(const file of adminFiles)
{
	const action = require(`./admin/${file}`);
	console.log("-> -> -> Adding action " + action.name);
	actions.set(action.name, action);
}

module.exports = {
  name: "admin",
  description: "Actions for Admins",
  exec(msg, args)
  {
    db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));
    var embed = new Discord.MessageEmbed().setColor("#CE3142")

    if(msg.member.guild.id != "694503221804138596")
    {
      embed.setTitle("⚠ This is a feature exclusive to Bit Inc!");
      embed.setDescription("You can join Bit Inc with the link above")
      embed.setURL("https://discord.gg/M5tysbt");
      msg.channel.send(embed);
      return;
    }

    if(!msg.member.roles.cache.find(r => r.id === adminID) && !msg.member.roles.cache.find(r => r.id === moderatorID), !msg.author === bitTimID)
    {
      embed.setTitle("❌ Insufficient Permission");
      msg.channel.send(embed);
      return;
    }

    if(args.length < 2)
    {
      embed.setTitle("❌ You have to specify an action");
      msg.channel.send(embed);
      return;
    }
    
    if(actions.get(args[1]) != undefined)
		{
			console.log("Found command " + args[1]);
			actions.get(args[1]).exec(msg, args)
		}
		else if(args[1] != "")
		{
			embed.setTitle("❌ \"" + args[1] + "\" is an invalid action");
      msg.channel.send(embed);
    }
  }
}
