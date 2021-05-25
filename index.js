const emoji = require("node-emoji");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
let linksCollection;
const app = express();
const port = 3000;
const length = 3; //define length of our abbreviation

//db connection 
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require("bson");
const uri = "mongodb+srv://dbuser:5uVkSa6U6TK3WLuJ@getraenkelistedb.4hnwb.mongodb.net/linkshortener?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Maximum amount of API request used" //message send to users if they exceed the number of requests.
});
async function connectDB() {
    client.connect(err => {
        linksCollection = client.db("linkshortener").collection("links");
        if (err) throw err;
    });
}
connectDB();

//function to generate random abbreviation with random emojis
async function shortenUrl(url) {
    //format our string so it doesn't include https:// and .com
    let shortened = ""; //create variable for our abbreviation
    for (let i = 0; i < length; i++) {
        shortened = shortened + emoji.random().emoji;
    }
    //save the url + abbrevation in a text file
    await saveGeneratedAbbrevationDB(shortened, url);
    return shortened;
}
//save our generated abbrevation to a txt file
async function saveGeneratedAbbrevationDB(shortened, url) {
    linksCollection.insertOne({
        "originalURL": url,
        "shortCode": shortened,
        "clickCounter": 0,
        "dateCreated": Date.now(),
        "adminCode": "WorkInProgress"
    });
}
//checks if the uri is a valid URL 
async function validateURL(uri) {
    //only send head request to get status code. 
    const config = {
        method: 'head',
        timeout: 3000,
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
async function updateLinkClickCounter(linkID, oldClickCounter) {
    oldClickCounter++;
    let newClickVal = { $set: { clickCounter: oldClickCounter } };
    console.log(newClickVal);
    let o_id = new ObjectId(linkID);
    linksCollection.updateOne({ '_id': o_id }, newClickVal, (err, res) => {
        if (err) throw err;
        else {
            console.log("sucessfully updated DB entry");
        }
    });
}
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
    res.send("service is alive");
});
// only apply to requests that begin with /code/
app.use("/code/generate", apiLimiter);

//endpoint to get the original url with the abbrevation
app.get("/code/:inputcode", async(req, res) => {
    let code = req.params.inputcode;
    linksCollection.findOne({ shortCode: code }, (err, result) => {
        if (err) {
            res.status(404).send("No DB entry found");
            throw err;
        } else {
            console.log(result.originalURL);
            updateLinkClickCounter(result._id, result.clickCounter);
            let updatedClickVal = result.clickCounter + 1;
            res.status(200).send({ url: result.originalURL, clickCounter: updatedClickVal });
        }
    });
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