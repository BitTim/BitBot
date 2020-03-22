const fs = require("fs")

var statFile = "data/wordstat.json"
var tmpStat = fs.readFileSync(statFile, "utf8")
var currStat = JSON.parse(tmpStat)
console.log(currStat);

module.exports = {
  update: function (msg)
  {
    var data = msg.split(" ")
    console.log("Parsed Mesage: " + data)
    
    let wordExist = false
    for(var j = 0; j < data.length; j++)
    {
      for(var i = 0; i < currStat.length; i++) 
      {
        if(currStat[i].word == data[j])
        {
          currStat[i].amount++
          wordExist = true
        }
      }

      if(!wordExist) currStat.push({"word":data[j], "amount":1})
    }

    currStat.sort((a, b) => b.amount - a.amount)

    fs.writeFile(statFile, JSON.stringify(currStat, null, "\t"), (err) => {
      if (err) throw err
    })
  },
  getStat: function(num = 10)
  {
    if(num > currStat.length) num = currStat.length
    return currStat.slice(0, num)
  }
}