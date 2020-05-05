const Discord = require("discord.js")
const fs = require("fs")

const reelSymbols = ["🇩🇪", "💍", "👑", "🏆", "💎", "🍑", "👌", "💰"];
var db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));
var slotDone = true;

module.exports = {
  name: "slot",
  description: "A slot machine style game",
  async exec(msg, args)
  {
    db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));
    var embed = new Discord.MessageEmbed().setColor("#CE3142")
   
    if(!slotDone)
    {
      embed.setTitle("⏳ Please wait until the previous instance finished");
      msg.channel.send(embed);
      return;
    }

    slotDone = false;
	  
    if(args.length < 3) args.push(1);

    if(args[2] === "paytable")
    {
      embed.setTitle("🎰 Paytable");
      embed.addField("Condition", `
      3 Equal
      2 Equal
      At least 1 Diamond
      At least 1 Germany Flag
      `, true);
      embed.addField("Payout", `
      Bet x10 Bits
      Bet x2 Bits
      Bet x0.75 Bits
      Bet x0.25 Bits
      `, true);
      msg.channel.send(embed);
      slotDone = true;
      return;
    }

    if(isNaN(args[2]))
    {
      embed.setTitle("❌ You have to enter a number for your bet");
      msg.channel.send(embed);
      slotDone = true;
      return;
    }

    args[2] = Math.ceil(args[2]);

    if(Number(args[2]) < 1)
    {
      embed.setTitle("❌ You cannot bet less than 1 Bit");
      msg.channel.send(embed);
      slotDone = true;
      return;
    }

    if(Number(args[2]) > 50)
    {
      embed.setTitle("❌ You cannot bet more than 50 Bits");
      msg.channel.send(embed);
      slotDone = true;
      return;
    }

    if(db.find(user => user.id === msg.author.id).bits < 0)
    {
      embed.setTitle("⚠ Warning, you are using the Bits from your loan");
      msg.channel.send(embed);
    }

    if(db.find(user => user.id === msg.author.id).bits < -1000000000)
    {
      embed.setTitle("🔴 You have used to much of your loan, get funds from other users");
      msg.channel.send(embed);
      slotDone = true;
      return
    }

    var bet = Number(args[2]);

    if((db.find(user => user.id === msg.author.id).bits >= 0 && db.find(user => user.id === msg.author.id).bits < bet) || db.find(user => user.id === msg.author.id).bits - bet < -1000000000)
    {
      embed.setTitle("❌ Insufficient funds");
      msg.channel.send(embed);
      slotDone = true;
      return;
    }

    var bal = db.find(user => user.id === msg.author.id).bits;
    db.find(user => user.id === msg.author.id).bits -= bet;
    bal -= bet;
    
    embed.setTitle("🎰 Slot Machine (" + msg.author.username + ")")
    embed.addField("Reel", "❓❓❓\n❓❓❓ <\n❓❓❓", true);
    embed.addField("Payment", "💳 You have paid " + bet + " Bits", true);
    embed.addField("Payout", "⏳ Awaiting results", true);
    embed.addField("Bonuses", "⏳ Awaiting results", true);
    embed.addField("Change in balance", (bal + bet) + " Bits > " + bal + " Bits\n", true);

    var pos = [Math.floor(Math.random() * Math.floor(reelSymbols.length)), Math.floor(Math.random() * Math.floor(reelSymbols.length)), Math.floor(Math.random() * Math.floor(reelSymbols.length))];
    var pos_bef = [pos[0] - 1, pos[1] - 1, pos[2] - 1]
    var pos_aft = [pos[0] + 1, pos[1] + 1, pos[2] + 1]

    for(var i = 0; i < 3; i++) if(pos_bef[i] < 0) pos_bef[i] = reelSymbols.length - 1;
    for(var i = 0; i < 3; i++) if(pos_aft[i] >= reelSymbols.length) pos_aft[i] = 0;

    var spin = await msg.channel.send(embed);

    embed.fields[0] = {name: "Reel", value: reelSymbols[pos_bef[0]] + "❓❓\n" + reelSymbols[pos[0]] + "❓❓ <\n" + reelSymbols[pos_aft[0]] + "❓❓", inline: true};
    await spin.edit(embed);

    embed.fields[0] = {name: "Reel", value: reelSymbols[pos_bef[0]] + reelSymbols[pos_bef[1]] + "❓\n" + reelSymbols[pos[0]] + reelSymbols[pos[1]] + "❓ <\n" + reelSymbols[pos_aft[0]] + reelSymbols[pos_aft[1]] + "❓", inline: true};
    await spin.edit(embed);
	  
    embed.fields[0] = {name: "Reel", value: reelSymbols[pos_bef[0]] + reelSymbols[pos_bef[1]] + reelSymbols[pos_bef[2]] + "\n" + reelSymbols[pos[0]] + reelSymbols[pos[1]] + reelSymbols[pos[2]] + "< \n" + reelSymbols[pos_aft[0]] + reelSymbols[pos_aft[1]] + reelSymbols[pos_aft[2]] + "\n", inline: true};
    await spin.edit(embed)

    var initialBet = bet;
    pos = pos.sort();
    if(pos[0] === pos[1] && pos[1] === pos[2])
    {
      bet = Math.floor(bet * 10);
      embed.fields[2] = {name: "Payout", value: "🎰 Spin: " + bet + " Bits"};
    }
    else if(pos[0] === pos[1] || pos[1] === pos[2])
    {
      bet = Math.floor(bet * 2);
      embed.fields[2] = {name: "Payout", value: "🎰 Spin: " + bet + " Bits"};
    }
    else
    {
      bet = 0;
      embed.fields[2] = {name: "Payout", value: "🎰 Spin: 0 Bits"};
    }

    if(embed.fields[3].value.includes("Awaiting results")) embed.fields[3].value = "";

    if(pos.includes(0))
    {
      bet += Math.round(initialBet * 0.25);
      var val = embed.fields[3].value += "Germany Bonus: 25% of the Bet\n";
      embed.fields[3] = {name: "Bonuses", value: val, inline: true}
    }

    if(pos.includes(4))
    {
      bet += Math.round(initialBet * 0.75);
      var val = embed.fields[3].value += "Diamond Bonus: 75% of the Bet\n";
      embed.fields[3] = {name: "Bonuses", value: val, inline: true}
    }

    if(embed.fields[3].value === "") embed.fields[3].value = "No Bonuses";
    bal += Number(bet);
		
    if(bet === 0) embed.fields[2] = {name: "Payout", value: embed.fields[2].value += "\n💨 You have won nothing", inline: true};
    else embed.fields[2] = {name: "Payout", value: embed.fields[2].value += "\n💰 You won " + bet + " Bits!", inline: true};

    embed.fields[4] = {name: "Change in balance", value: embed.fields[4].value += (bal - bet) + " Bits > " + bal + " Bits\n", inline: true}; 

    db.find(user => user.id === msg.author.id).bits += bet;
    fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
    await spin.edit(embed);

    slotDone = true;
  }
}
