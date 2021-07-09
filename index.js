const emoji = require("node-emoji");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
let linksCollection;
const app = express();
const port = 3000;
const length = 3; //define length of our abbreviation
const path = require('path');

//db connection 
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require("bson");
const uri = "mongodb+srv://dbuser:5uVkSa6U6TK3WLuJ@getraenkelistedb.4hnwb.mongodb.net/linkshortener?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//setup ratelimiter to limit the API requests to 100 in 15 minutes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Maximum amount of API request used" //message send to users if they exceed the number of requests.
});
//Function to connect to our database
async function connectDB() {
    client.connect(err => {
        linksCollection = client.db("linkshortener").collection("links");
        if (err) throw err;
    });
}
connectDB();

//function to generate random abbreviation with random emojis
async function shortenUrl() {
    let shortened = ""; //create a variable to write the abbrevation to
    //the length is set above (currently set to 3)
    for (let i = 0; i < length; i++) {
        shortened = shortened + emoji.random().emoji;
    }
    return shortened;
}
//save our generated abbrevation in the MongoDB Database
async function saveGeneratedAbbrevationDB(shortened, url, adminLink, ipAdress) {
    linksCollection.insertOne({
        "originalURL": url,
        "shortCode": shortened,
        "clickCounter": 0,
        "dateCreated": Date.now(),
        "adminCode": adminLink,
        "clientIpAdress": ipAdress
    });
}
//checks if the uri is a valid URL 
async function validateURL(uri) {
    //only send head request to get status code, to limit ressources needed 
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
//Function to update the Counter of each abbrevation and the times it has been viewed
async function updateLinkClickCounter(linkID, oldClickCounter) {
    //Add one to the clickCounter
    let newClickCounter = oldClickCounter + 1;
    let newClickVal = { $set: { clickCounter: newClickCounter } };
    //Search for the given ID in the Databse
    let o_id = new ObjectId(linkID);
    //update the entry with the new updated Click Value
    linksCollection.updateOne({ '_id': o_id }, newClickVal, (err, res) => {
        if (err) throw err;
        else {
            console.log("sucessfully updated DB entry");
        }
    });
}
//function to get a link entry by its abbrevation
async function getDBentryByCode(code) {
    return await linksCollection.findOne({ shortCode: code });
}
//function to get a link entry by its admin code
async function getDBentryByAdminCode(code) {
    return await linksCollection.findOne({ adminCode: code });
}
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
    res.send("service is alive");
});
// only apply to requests that begin with /code/
app.use("/code/generate", apiLimiter);

//test api endpoint (will be removed in later process)
app.get("/test", async(req, res) => {
    let data = await getDBentryByCode("abc");
    console.log(data);
    res.status(200).send(data).end();
});

//endpoint to get the original url with the abbrevation
app.get("/code/:inputcode", async(req, res) => {
    let code = req.params.inputcode;
    //find the matching entry in our Databbase
    let DBentry = await getDBentryByCode(code);
    if (DBentry === null) {
        res.status(404).send("No DB entry found");
    } else {
        //Update the Link ClickCounter
        updateLinkClickCounter(DBentry._id, DBentry.clickCounter);
        //send the original url + updated clickcounter back to frontend
        let updatedClickVal = DBentry.clickCounter + 1;
        res.status(200).send({ url: DBentry.originalURL, clickCounter: updatedClickVal });
    }
});

//endpoint to generate an abbrevation from the url
app.post("/code/generate", async(req, res) => {
    let uri = req.body.url;
    let adminLink = req.body.adminLink;
    let clientIp = req.body.ipAddress;
    console.log(uri);
    console.log(clientIp);
    let short = await shortenUrl();
    //check if we have a reachable & valid url
    if (await validateURL(uri)) {
        //save the URL + Shortened version in the database
        await saveGeneratedAbbrevationDB(short, uri, adminLink, clientIp);
        res.status(200).send({ url: short }).end();
    } else {
        res.status(404).send("Given URL is not valid!").end();
    }
});
app.post("/code/generateManual", async(req, res) => {
    let uri = req.body.url;
    let adminLink = req.body.adminLink;
    let clientIp = req.body.ipAddress;
    let abbrevation = req.body.abbrevation;
    console.log(uri);
    console.log(clientIp);
    console.log(abbrevation);
    //check if we have a reachable & valid url
    if (await validateURL(uri)) {
        //save the URL + Shortened version in the database
        console.log("dbEntry: " + linksCollection.findOne({ shortCode: abbrevation }));
        if (linksCollection.findOne({ shortCode: abbrevation }) != null) {
            await saveGeneratedAbbrevationDB(abbrevation, uri, adminLink, clientIp);
            res.status(200).send({ url: abbrevation }).end();
        } else {
            res.status(404).send("Given abbrevation is already used").end();
        }
    } else {
        res.status(404).send("Given URL is not valid!").end();
    }
});

//endpoint to get matching db entry for given AdminCode
app.get("/admin/:adminCode", async(req, res) => {
    let adminLink = req.params.adminCode;
    let dbEntry = await getDBentryByAdminCode(adminLink);
    if (dbEntry !== null) {
        res.status(200).send(dbEntry).end();
    } else {
        console.log(adminLink);
        res.status(404).send("Given AdminLink is not valid!").end();
    }
});
//endpoint to update an existing dbEntry by adminLink
app.post("/code/updateExisting", async(req, res) => {
    let adminLink = req.body.adminLink;
    let updatedURL = req.body.newURL;
    let newURL = { $set: { 'originalURL': updatedURL } };
    if (await validateURL(updatedURL)) {
        linksCollection.updateOne({ 'adminCode': adminLink }, newURL, (err, result) => {
            if (err) console.log("err");
            else {
                console.log("sucessfully updated DB originalURL");
                res.status(200).send("Update was sucessful").end();
            }
        });
    } else {
        res.status(404).send("Given URL is not valid!").end();
    }
});
//endpoint to delete an existing dbEntry by adminLink 
app.post("/code/deleteExisting", async(req, res) => {
    let adminLink = req.body.adminLink;
    linksCollection.deleteOne({ 'adminCode': adminLink }, (err, result) => {
        if (err) {
            console.log("err");
            res.status(404).send("Couldn't delete DBentry").end();
        } else {
            console.log("sucessfully deleted DB entry");
            res.status(200).send("Update was sucessful").end();
        }
    });
});
//endpoint to get all DB entries for the admin dashboard
app.get("/adminDashboard/getAllEntries", async(req, res) => {
    await linksCollection.find({}).toArray(function(err, result) {
        if (err) {
            res.status(500).send(err).end();
        } else {
            res.status(200).send(JSON.stringify(result)).end();
        }
    });
});
//emoji endpoints
/*__dirname = "./emojiPicker";

app.get("/fgEmojiPicker.js", (req, res) => {
    res.sendFile(path.join(__dirname, './emojiPicker/fgEmojiPicker.js'));
});
app.get("/full-emoji-list.json", (req, res) => {
    res.sendFile(path.join(__dirname, './emojiPicker/full-emoji-list.json'));
});
*/
app.listen(port, () => {
    console.log(`Joschs app listening at http://localhost:${port}`);
});