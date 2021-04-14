const emoji = require("node-emoji");
const fs = require("fs").promises;
const fssync = require("fs");
const express = require("express");
var cors = require('cors');
const app = express();
const port = 3000;

const length = 3; //define length of our abbreviation

//function to generate random abbreviation with random emojis
async function shortenUrl(url) {
    //format our string so it doesn't include https:// and .com
    let shortened = ""; //create variable for our abbreviation
    for (let i = 0; i < length; i++) {
        shortened = shortened + emoji.random().emoji;
    }
    //save the url + abbrevation in a text file
    await saveGeneratedAbbrevation(shortened, url);
    return shortened;
}
//save our generated abbrevation to a txt file
async function saveGeneratedAbbrevation(shortened, url) {
    await fs.writeFile(
        "./abbrevationTxt/" + shortened + ".txt",
        url,
        () => {
            console.log("File written!");
        }
    );
}
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    res.send("service is alive");
});
//endpoint to get the original url with the abbrevation
app.get("/code/:inputcode", async(req, res) => {
    let c = req.params.inputcode;
    if (fssync.existsSync("./abbrevationTxt/" + c + ".txt")) {
        let data = await findURL(c);
        res.status(200).send("this is the original link: " + data.toString());
    } else
        res.status(404).send("couldn't find the link you're looking for");
});
//endpoint to generate an abbrevation from the url
app.post('/code/generate', async(req, res) => {
    console.log(req.body.url);
    //TODO: check if url is a valid url
    let short = shortenUrl(req.body.url);
    res.status(200).send({ url: short }).end();
});
app.listen(port, () => {
    console.log(`Joschs app listening at http://localhost:${port}`);
});
//find  url in txt files
async function findURL(code) {
    return await fs.readFile("./abbrevationTxt/" + code + ".txt");
}