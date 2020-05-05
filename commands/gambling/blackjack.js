const Discord = require("discord.js")
const fs = require("fs")

const colors = ["♠", "♦", "♣", "♥"]; 
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

var bjDone = true;
var mainLoop = null;
var dealHit = null;

function interval(func, wait, times){
  var interv = function(w, t){
    return function(){
      if(typeof t === "undefined" || t-- > 0){
        setTimeout(interv, w);
        try{
          func.call(null);
        }
        catch(e){
          t = 0;
          throw e.toString();
        }
      }
    };
  }(wait, times);

  setTimeout(interv, wait);
};

module.exports = {
  name: "blackjack",
  description: "A Blackjack game",
  async exec(msg, args)
  {
    db = JSON.parse(fs.readFileSync("./data/users.json", "utf8"));
    var embed = new Discord.MessageEmbed().setColor("#CE3142")
   
    if(!bjDone)
    {
      embed.setTitle("⏳ Please wait until the previous instance finished");
      msg.channel.send(embed);
      return;
    }

    bjDone = false;
	  
    if(args.length < 3) args.push(2);

    if(isNaN(args[2]))
    {
      embed.setTitle("❌ You have to enter a number for your bet");
      msg.channel.send(embed);
      bjDone = true;
      return;
    }

    args[2] = Math.ceil(args[2]);

    if(Number(args[2]) < 2)
    {
      embed.setTitle("❌ You cannot bet less than 2 Bits");
      msg.channel.send(embed);
      bjDone = true;
      return;
    }

    if(Number(args[2]) > 50)
    {
      embed.setTitle("❌ You cannot bet more than 50 Bits");
      msg.channel.send(embed);
      bjDone = true;
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
      bjDone = true;
      return
    }

    var bet = Number(args[2]);

    if((db.find(user => user.id === msg.author.id).bits >= 0 && db.find(user => user.id === msg.author.id).bits < bet) || db.find(user => user.id === msg.author.id).bits - bet < -1000000000)
    {
      embed.setTitle("❌ Insufficient funds");
      msg.channel.send(embed);
      bjDone = true;
      return;
    }

    var bal = db.find(user => user.id === msg.author.id).bits;
    db.find(user => user.id === msg.author.id).bits -= bet;
    bal -= bet;

    var dealCards = [Math.floor(Math.random() * Math.floor(13)), Math.floor(Math.random() * Math.floor(13))]
    var playerCards = [Math.floor(Math.random() * Math.floor(13)), Math.floor(Math.random() * Math.floor(13))]

    var dealColors = [Math.floor(Math.random() * Math.floor(4)), Math.floor(Math.random() * Math.floor(4))]
    var playerColors = [Math.floor(Math.random() * Math.floor(4)), Math.floor(Math.random() * Math.floor(4))]

    embed.setTitle("🃏 Blackjack (" + msg.author.username + ")")
    embed.addField("Dealer cards", this.getCardString(dealCards.slice(0, 1), dealColors), true);
    embed.addField("Your cards", this.getCardString(playerCards, playerColors), true);
    embed.addField("Payment", "💳 You have paid " + bet + " Bits", true);
    embed.addField("Payout", "⏳ Awaiting results", true);
    embed.addField("Change in balance", (bal + bet) + " Bits > " + bal + " Bits\n", true);
    embed.addField("Notes", "You have 30 seconds to answer either \"stay\" to keep your current hand, or \"hit\" to get another card\nIf you take longer than 30 sec, you will get half of your bet in return", false);
    var blackjack = await msg.channel.send(embed);

    var evalPlayer = this.evalCards(playerCards);

    if(evalPlayer === 21)
    {
      bet += Math.round(bet * 1.5)
      embed.fields[3].value = "🃏 Blackjack!\n💰 You won " + bet + " Bits!";
      embed.fields[4].value += bal + " Bits > " + (bal + bet) + " Bits\n";
      embed.fields = embed.fields.slice(0, 5);
      db.find(user => user.id === msg.author.id).bits += bet;
      fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });

      await blackjack.edit(embed);
      bjDone = true;
      return;
    }

    var c = 0;

    while(!bjDone)
    {
      console.log("loop " + c++);
      const options = ["stay", "hit"]
      const filter = m => m.author.id === msg.author.id && options.includes(m.content.toLowerCase())
      
      var evalPlayer = this.evalCards(playerCards);
      var autostay = false;
      if(evalPlayer === 21)
      {
        autostay = true
        embed.fields[5].value = "You are at a value of 21, you will stay regardless of what command(hit, stay) you give"
        await blackjack.edit(embed);
      }

      await blackjack.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
	    .then(async collected => {
        if(collected.first().content.toLowerCase() === "stay" || autostay)
        {
          embed.fields[0].value = this.getCardString(dealCards, dealColors);
          await blackjack.edit(embed);

          var evalDeal = 0;
          evalDeal = this.evalCards(dealCards);
          console.log(evalDeal);

          while(evalDeal < 17)
          {
            dealCards.push(Math.floor(Math.random() * Math.floor(13)));
            dealColors.push(Math.floor(Math.random() * Math.floor(4)));
            evalDeal = this.evalCards(dealCards);
            
            embed.fields[0].value = this.getCardString(dealCards, dealColors);
            await blackjack.edit(embed);
          }

          evalPlayer = this.evalCards(playerCards);
          evalDeal = this.evalCards(dealCards);

          if(evalDeal > 21 || (evalPlayer <= 21 && evalPlayer > evalDeal))
          {
            bet = Math.round(bet * 2)
            if(evalDeal > 21) embed.fields[3].value = "💥 Dealer Bust\n💰 You won " + bet + " Bits!";
            else embed.fields[3].value = "💰 You won " + bet + " Bits!";
            embed.fields[4].value += bal + " Bits > " + (bal + bet) + " Bits\n";
            db.find(user => user.id === msg.author.id).bits += bet;
            fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });

            await blackjack.edit(embed);
            bjDone = true;
            return;
          }

          if(evalPlayer < evalDeal)
          {         
            embed.fields[3].value = "💨 You lost";
            embed.fields[4].value += bal + " Bits > " + bal + " Bits\n";

            fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });

            await blackjack.edit(embed);
            bjDone = true;
            return;
          }

          if(evalPlayer === evalDeal)
          {           
            embed.fields[3].value = "👔 It's a Tie! You regain your bet";
            embed.fields[4].value += bal + " Bits > " + (bal + bet) + " Bits\n";
            db.find(user => user.id === msg.author.id).bits += bet;
            fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });

            await blackjack.edit(embed);
            bjDone = true;
            return;
          }
        }
        else if(collected.first().content.toLowerCase() === "hit")
        {
          playerCards.push(Math.floor(Math.random() * Math.floor(13)));
          playerColors.push(Math.floor(Math.random() * Math.floor(4)));
          var evalPlayer = this.evalCards(playerCards);

          embed.fields[1].value = this.getCardString(playerCards, playerColors);
          await blackjack.edit(embed);

          if(evalPlayer > 21)
          {            
            embed.fields[3].value = "💥 You Busted\n💨 You lost";
            embed.fields[4].value += bal + " Bits > " + bal + " Bits\n";

            fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });

            await blackjack.edit(embed);
            bjDone = true;
            return;
          }
        }
      })
	    .catch(async collected => {        
        embed.setTitle("❌ You ran out of time to answer");
        embed.fields = [];
        embed.addField("Notes", "Half of your bet (" + bet + ") will be returned");
      
        db.find(user => user.id === msg.author.id).bits += Math.round(bet / 2);
        fs.writeFile("./data/users.json", JSON.stringify(db, null, "\t"), (err) => { if(err) throw err; });
      
        await blackjack.edit(embed);
        bjDone = true;
        return;
      });
    }
  },
  evalCards(cards)
  {
    var val = 0;
    for(var i = 0; i < cards.length; i++)
    {
      if(values[cards[i]] === "K" || values[cards[i]] === "Q" || values[cards[i]] === "J") val += 10;
      else if(values[cards[i]] != "A")
      {
        val += Number(values[cards[i]]);
      }
    }

    for(var i = 0; i < cards.length; i++)
    {
      if(values[cards[i]] === "A")
      {
        if(val + 11 <= 21) val += 11;
        else val += 1;
      }
    }

    return val;
  },
  getCardString(cards, cols)
  {
    var string = "";
    for(var i = 0; i < cards.length; i++)
    {
      if(i != 0) string += ", ";
      string += values[cards[i]] + " " + colors[cols[i]];
    }

    string += " (Value: " + this.evalCards(cards) + ")"
    return string;
  }
}
