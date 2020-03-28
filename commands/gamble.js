const Discord = require("discord.js")
const fs = require("fs")

var db = JSON.parse(fs.readFileSync("data/users.json", "utf8"));
var cases = JSON.parse(fs.readFileSync("data/cases.json", "utf8"));

const reelSymbols = ["🇩🇪", "💍", "👑", "🏆", "💎", "🍑", "👌", "💰"];

module.exports = {
  name: "gamble",
  description: "Lets you gamble with bits",
  async exec(msg, args)
  {
    db = JSON.parse(fs.readFileSync("data/users.json", "utf8"));

    var embed = new Discord.MessageEmbed().setColor("#CE3142")
    if(args.length < 2)
    {
      embed.setTitle("❌ You have to specify a game to play");
      msg.channel.send(embed);
      return;
    }

    if(args[1] === "list")
    {
      embed.setTitle("🎰 Gambling games");
      embed.addField("Games", "slot", true);
      embed.addField("Payment", "min. 1 Bit", true);
      msg.channel.send(embed);
    }
    else if(args[1] === "loan")
    {
      if(db.find(user => user.id === msg.author.id).bits === 0)
      {
        embed.setTitle("🏦 You have been given 5 Bits as a loan");
        msg.channel.send(embed);

        db.find(user => user.id === msg.author.id).bits -= 5;
      }
      else
      {
        embed.setTitle("❌ You still have Bits, you cannot take a loan");
        msg.channel.send(embed);
      }
    }
    else if(args[1] === "slot")
    {
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

      db.find(user => user.id === msg.author.id).bits -= bet;
      embed.setTitle("➖ You have paid " + bet + " Bits");
      embed.addField("Change in balance", (db.find(user => user.id === msg.author.id).bits + bet) + " Bits > " + db.find(user => user.id === msg.author.id).bits + " Bits")
      msg.channel.send(embed);

      var pos = [Math.floor(Math.random() * Math.floor(reelSymbols.length)), Math.floor(Math.random() * Math.floor(reelSymbols.length)), Math.floor(Math.random() * Math.floor(reelSymbols.length))];
      var pos_bef = [pos[0] - 1, pos[1] - 1, pos[2] - 1]
      var pos_aft = [pos[0] + 1, pos[1] + 1, pos[2] + 1]

      for(var i = 0; i < 3; i++) if(pos_bef[i] < 0) pos_bef[i] = reelSymbols.length - 1;
      for(var i = 0; i < 3; i++) if(pos_aft[i] >= reelSymbols.length) pos_aft[i] = 0;

      embed.fields.splice(0, 1);

      embed.setTitle("❓❓❓\n❓❓❓ <\n❓❓❓")
      var spin = await msg.channel.send(embed);

      var counter = 0;
      var interval = setInterval(() => {
        if(counter === 0) embed.setTitle(reelSymbols[pos_bef[0]] + "❓❓\n" + reelSymbols[pos[0]] + "❓❓ <\n" + reelSymbols[pos_aft[0]] + "❓❓");
        if(counter === 1) embed.setTitle(reelSymbols[pos_bef[0]] + reelSymbols[pos_bef[1]] + "❓\n" + reelSymbols[pos[0]] + reelSymbols[pos[1]] + "❓ <\n" + reelSymbols[pos_aft[0]] + reelSymbols[pos_aft[1]] + "❓");
        if(counter === 2) embed.setTitle(reelSymbols[pos_bef[0]] + reelSymbols[pos_bef[1]] + reelSymbols[pos_bef[2]] + "\n" + reelSymbols[pos[0]] + reelSymbols[pos[1]] + reelSymbols[pos[2]] + "< \n" + reelSymbols[pos_aft[0]] + reelSymbols[pos_aft[1]] + reelSymbols[pos_aft[2]] + "\n");

        spin.edit(embed).then(() => {
          if(++counter >= 3)
          {
            clearInterval(interval);

            pos = pos.sort();
            if(pos[0] === pos[1] === pos[2])
            {
              bet = Math.floor(bet * 10);
              embed.addField("Payout", "Spin: " + bet + " Bits\n");
            }
            else if(pos[0] === pos[1] || pos[1] === pos[2])
            {
              bet = Math.floor(bet * 1.25);
              embed.addField("Payout", "Spin: " + bet + " Bits\n");
            }
            else
            {
              bet = 0;
              embed.addField("Payout", "Spin: 0 Bits\n");
            }

            if(pos.includes(0))
            {
              bet += 1;
              var val = embed.fields[0].value += "Germany Bonus: 1 Bits\n";
              embed.fields[0] = {name: "Payout", value: val}
            }

            if(pos.includes(4))
            {
              bet += 3;
              var val = embed.fields[0].value += "Diamond Bonus: 3 Bits\n";
              embed.fields[0] = {name: "Payout", value: val}
            }

            if(bet === 0) embed.setTitle("💨 You have won nothing");
            else embed.setTitle("💰 You won " + bet + " Bits!");

            embed.addField("Change in balance", db.find(user => user.id === msg.author.id).bits + " Bits > " + (db.find(user => user.id === msg.author.id).bits + bet) + " Bits");

            db.find(user => user.id === msg.author.id).bits += bet;
            fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
            msg.channel.send(embed);
          }
        })
      }, 1000)
    }
    else
    {
      embed.setTitle("❌ \"" + args[1] + "\" is an invalid game");
      msg.channel.send(embed);
    }

    fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
  }
}