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
      return;
    }

    slotDone = false;
	  
    if(args.length < 3) args.push(1);

    if(args[2] === "paytable")
    {
      embed.setTitle("🎰 Paytable");
      embed.addField("Condition", "3 Equal\n2 Equal\nAt least 1 Diamond\nAt least 1 Germany Flag", true);
      embed.addField("Payout", "Bet x10 Bits\nBet x1.25 Bits\n3 Bits\n1 Bit", true);
      msg.channel.send(embed);
      return;
    }

    if(Number(args[2]) <= 0)
    {
      embed.setTitle("❌ You cannot bet less than 1 Bit");
      msg.channel.send(embed);
      return;
    }

    var bet = Number(args[2]);

    if(db.find(user => user.id === msg.author.id).bits < bet &&db.find(user => user.id === msg.author.id).bits >= 0 )
    {
      embed.setTitle("❌ Insufficient funds");
      msg.channel.send(embed);
      return;
    }

    if(db.find(user => user.id === msg.author.id).bits < 0)
    {
      embed.setTitle("⚠ Warning, you are using the Bits from your loan");
      msg.channel.send(embed);
    }

    var bal = db.find(user => user.id === msg.author.id).bits;
    db.find(user => user.id === msg.author.id).bits -= bet;
    bal -= bet;
    
    embed.setTitle("🎰 Slot Machine")
    embed.addField("Reel", "❓❓❓\n❓❓❓ <\n❓❓❓", true);
    embed.addField("Payment", "➖ You have paid " + bet + " Bits", true);
    embed.addField("Payout", "Awaiting results", true);
    embed.addField("Bonuses", "Awaiting results", true);
    embed.addField("Change in balance", (bal + bet) + " Bits > " + bal + " Bits\n", true);

    var pos = [Math.floor(Math.random() * Math.floor(reelSymbols.length)), Math.floor(Math.random() * Math.floor(reelSymbols.length)), Math.floor(Math.random() * Math.floor(reelSymbols.length))];
    var pos_bef = [pos[0] - 1, pos[1] - 1, pos[2] - 1]
    var pos_aft = [pos[0] + 1, pos[1] + 1, pos[2] + 1]

    for(var i = 0; i < 3; i++) if(pos_bef[i] < 0) pos_bef[i] = reelSymbols.length - 1;
    for(var i = 0; i < 3; i++) if(pos_aft[i] >= reelSymbols.length) pos_aft[i] = 0;

    var spin = await msg.channel.send(embed);

    var counter = 0;
    var interval = setInterval(() => {
      if(counter === 0) embed.fields[0] = {name: "Reel", value: reelSymbols[pos_bef[0]] + "❓❓\n" + reelSymbols[pos[0]] + "❓❓ <\n" + reelSymbols[pos_aft[0]] + "❓❓"};
      if(counter === 1) embed.fields[0] = {name: "Reel", value: reelSymbols[pos_bef[0]] + reelSymbols[pos_bef[1]] + "❓\n" + reelSymbols[pos[0]] + reelSymbols[pos[1]] + "❓ <\n" + reelSymbols[pos_aft[0]] + reelSymbols[pos_aft[1]] + "❓"};
      if(counter === 2) embed.fields[0] = {name: "Reel", value: reelSymbols[pos_bef[0]] + reelSymbols[pos_bef[1]] + reelSymbols[pos_bef[2]] + "\n" + reelSymbols[pos[0]] + reelSymbols[pos[1]] + reelSymbols[pos[2]] + "< \n" + reelSymbols[pos_aft[0]] + reelSymbols[pos_aft[1]] + reelSymbols[pos_aft[2]] + "\n"};

      spin.edit(embed).then(() => {
        if(++counter >= 3)
        {
          clearInterval(interval);

          pos = pos.sort();
          if(pos[0] === pos[1] && pos[1] === pos[2])
          {
            bet = Math.floor(bet * 10);
            embed.fields[2] = {name: "Payout", value: "Spin: " + bet + " Bits"};
          }
          else if(pos[0] === pos[1] || pos[1] === pos[2])
          {
            bet = Math.floor(bet * 1.25);
            embed.fields[2] = {name: "Payout", value: "Spin: " + bet + " Bits"};
          }
          else
          {
            bet = 0;
            embed.fields[2] = {name: "Payout", value: "Spin: 0 Bits"};
          }

	  
	  if(embed.fields[3].value.includes("Awaiting results")) embed.fields[3].value = "";

          if(pos.includes(0))
          {
            bet += 1
            var val = embed.fields[3].value += "Germany Bonus: 1 Bits\n";
            embed.fields[3] = {name: "Bonuses", value: val}
          }

          if(pos.includes(4))
          {
            bet += 2;
            var val = embed.fields[3].value += "Diamond Bonus: 2 Bits\n";
            embed.fields[3] = {name: "Bonuses", value: val}
          }

	  if(embed.fields[3].value === "") embed.fields[3].value = "No Bonuses";
	  bal += Number(bet);
		
          if(bet === 0) embed.fields[2] = {name: "Payout", value: embed.fields[2].value += "\n💨 You have won nothing"};
          else embed.fields[2] = {name: "Payout", value: embed.fields[2].value += "\n💰 You won " + bet + " Bits!"};

          embed.fields[4] = {name: "Change in balance", value: embed.fields[4].value += (bal - bet) + " Bits > " + bal + " Bits\n"}; 

          db.find(user => user.id === msg.author.id).bits += bet;
          fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
	  spin.edit(embed);

	  slotDone = true;
        }
      })
    }, 1000)
  }
}
