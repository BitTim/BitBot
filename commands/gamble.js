const Discord = require("discord.js")
const fs = require("fs")

games = new Discord.Collection();
var db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));

console.log("-> -> Getting games")
const gamblingFiles = fs.readdirSync("./commands/gambling").filter(file => file.endsWith(".js"));
for(const file of gamblingFiles)
{
	const game = require(`./gambling/${file}`);
	console.log("-> -> -> Adding game " + game.name);
	games.set(game.name, game);
}

module.exports = {
  name: "gamble",
  description: "Lets you gamble with bits",
  exec(msg, args)
  {
    db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));
    var embed = new Discord.MessageEmbed().setColor("#CE3142")

    if(args.length < 2)
    {
      embed.setTitle("❌ You have to specify a game to play");
      msg.channel.send(embed);
      return;
    }

    if(!db.find(user => user.id === msg.author.id))
    {
      var user = {id: id, bits: 10, trolls: ["lmao"]}
      db.push(user);
    }
    
    if(games.get(args[1]) != undefined)
		{
			console.log("Found command " + args[1]);
			games.get(args[1]).exec(msg, args)
		}
		else if(args[1] != "")
		{
			embed.setTitle("❌ \"" + args[1] + "\" is an invalid game");
      msg.channel.send(embed);
    }
    
    fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
  }
}
