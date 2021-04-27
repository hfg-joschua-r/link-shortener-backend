const emoji = require("node-emoji");
const fs = require("fs").promises;
const express = require("express");
const cors = require("cors");
const axios = require("axios");

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
    await fs.writeFile("./abbrevationTxt/" + shortened + ".txt", url, () => {
        console.log("File written!");
    });
}
//find  url in txt files
async function findURL(code) {
    return await fs.readFile("./abbrevationTxt/" + code + ".txt");
}
//checks if the uri is a valid URL 
async function validateURL(uri) {
    //only send head request to get status code. 
    const config = {
        method: 'head',
        timeout: 5000,
        url: uri
    };
    try {
        let res = await axios(config);
        console.log(res.status);
        if (res.status == 200)
            return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
    res.send("service is alive");
});
//endpoint to get the original url with the abbrevation
app.get("/code/:inputcode", async(req, res) => {
    let c = req.params.inputcode;
    try {
        await fs.access("./abbrevationTxt/" + c + ".txt");
        console.log("file exists");
        let data = await findURL(c);
        res.status(200).send("this is the original link: " + data.toString());
    } catch {
        console.error("Kein Zugriff oder Datei existiert nicht");
        res.status(404).send("couldn't find the link you're looking for");
    }
});
//endpoint to generate an abbrevation from the url
app.post("/code/generate", async(req, res) => {
    let uri = req.body.url;
    console.log(uri);
    let short = await shortenUrl(uri);
    if (await validateURL(uri)) {
        res.status(200).send({ url: short }).end();
    } else {
        res.status(404).send("Given URL is not valid!").end();
    }
});
app.listen(port, () => {
    console.log(`Joschs app listening at http: //localhost:${port}`);
});