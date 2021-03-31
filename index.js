var emoji = require('node-emoji')
const fs = require("fs")
const express = require('express')
const app = express()
const port = 3000

const length = 3; //define length of our abbreviation 

//function to generate random abbreviation based on url input
function shortenUrl(url) {
    //format our string so it doesn't include https:// and .com
    if (url.includes("/")) {
        url = url.split("/").pop();
    }
    url = url.split(".")[0];
    var shortened = ""; //create variable for our abbreviation
    for (var i = 0; i < length; i++) {
        shortened = shortened + emoji.random().emoji;
        // var randomBoolean = Math.random() < 0.5; //generate random boolean to decide wether to use UpperCase or not
        // if (randomBoolean) {
        //     //add random letter from root url to our shortened version
        //     shortened = shortened + url.charAt(Math.floor(Math.random() * url.length)).toUpperCase();
        // } else {
        //     shortened = shortened + url.charAt(Math.floor(Math.random() * url.length));
        // }
    }
    return shortened;
}

//testcode
var st = [];
var duplicateCount = 0;

for (var i = 0; i < 1; i++) {
    var input = "https://google.com";
    generatedAbbreviation = shortenUrl(input);
    if (st.includes(generatedAbbreviation)) {
        console.log("There is a duplicate: " + generatedAbbreviation);
        duplicateCount++;
    }
    st.push(generatedAbbreviation);
    console.log(generatedAbbreviation);
    if (!fs.existsSync('./abbrevationTxt/' + generatedAbbreviation + ".txt"))
        fs.writeFile('./abbrevationTxt/' + generatedAbbreviation + ".txt", generatedAbbreviation, () => {
            //Callback - wird aufgerufen wenn die Datei erfolgreich geschrieben wurde
            console.log("Datei geschrieben!");
        });
    else {
        console.log("Warning: File already exists");
    }
}
app.get('/code/:inputcode', (req, res) => {
    console.log(req.params.inputcode);
    if (fs.existsSync('./abbrevationTxt/' + req.params.inputcode + ".txt")) {
       let data = fs.readFileSync('./abbrevationTxt/' + req.params.inputcode + ".txt");
       res.send(data);
    }
  })

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })