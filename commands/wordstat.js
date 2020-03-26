const fs = require("fs")
const Discord = require("discord.js");

var currStat = []
const bitTimID = "398134358575153154";

module.exports = {
  name: "wordstat",
  description: "Tracks the usage of words",
  exec(msg, args)
  {
    if(!args[1]) args[1] = 10;
		if(args[1] > 250) args[1] = 250;
    if(args[1] > currStat.length) args[1] = currStat.length;
    
    var embed = new Discord.MessageEmbed()
    .setColor("#CE3142");

    if(args[1] === "save")
    {
      if(msg.author.id === bitTimID)
      {
        var backStat = JSON.parse(fs.readFileSync("./backup/wordstat.json", "utf8", (err) => { if(err) throw err; }));
        for(var i = 0; i < backStat.length; i++)
        {
          for(var j = 0; j < currStat.length; j++)
          {
            if(currStat[j].word == backStat[i].word)
            {
              backStat[i].amount = -1234;
            }
          }
        }
        backStat = backStat.filter(stat => stat.amount != -1234);

        backStat = backStat.concat(currStat);
        backStat.sort((a, b) => b.amount - a.amount);

        fs.writeFile("./backup/wordstat.json", JSON.stringify(backStat, null, "\t"), (err) => { if(err) throw err; });
        embed.setTitle("✔ Backed up Wordstat");
      }
      else embed.setTitle("❌ Insufficient Permission");
    }
    else if(args[1] == "load")
    {
      if(msg.author.id === bitTimID)
      {
        var backStat = JSON.parse(fs.readFileSync("./backup/wordstat.json", "utf8", (err) => { if(err) throw err; }));
        for(var i = 0; i < currStat.length; i++)
        {
          for(var j = 0; j < backStat.length; j++)
          {
           if(backStat[j].word == currStat[i].word)
            {
              currStat[i].amount = -1234;
            }
          }
        }
        currStat = currStat.filter(stat => stat.amount != -1234);

        currStat = currStat.concat(backStat);
        currStat.sort((a, b) => b.amount - a.amount);

        embed.setTitle("✔ Loaded Backup of Wordstat");
      }
      else embed.setTitle("❌ Insufficient Permission");
    }
    else if(args[1] == "clear")
    {
      if(msg.author.id === bitTimID)
      {
        currStat = [];
        embed.setTitle("🧹 Cleared Wordstat");
      }
      else embed.setTitle("❌ Insufficient Permission");
    }
    else
    {
      var stat = currStat.slice(0, args[1]);
		  embed.setTitle("🔥 Top " + args[1] + " most used Words: 🔥");
			
		  if(stat.length === 0) embed.addField("Nope", "❌ No words tracked yet");
		  else
		  {
		  	for(var n = 0; n < args[1]; n += 10)
		  	{
		  		var tmpStr = "";
		  		for(var m = 0; m < 10; m++)
		  		{
			  		if(n + m >= stat.length) break;
				  	tmpStr += (n + m + 1) + ". " + stat[n + m].word + " (" + stat[n + m].amount + "x)\n";
				  }

				  if(n >= stat.length) break;
          embed.addField("Places " + (n + 1) + " to " + (n + 10), tmpStr, true);
        }
			}
    }
    
    msg.channel.send(embed);
  },
  update(msg)
  {
    var data = msg.content.split(" ");
    
    let wordExist = false;
    for(var j = 0; j < data.length; j++)
    {
      for(var i = 0; i < currStat.length; i++) 
      {
        if(currStat[i].word == data[j])
        {
          currStat[i].amount++;
          wordExist = true;
        }
      }

      if(!wordExist) currStat.push({"word":data[j], "amount":1});
    }

    currStat.sort((a, b) => b.amount - a.amount);
  }
}