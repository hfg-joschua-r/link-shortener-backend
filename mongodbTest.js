//db connection 
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dbuser:5uVkSa6U6TK3WLuJ@getraenkelistedb.4hnwb.mongodb.net/linkshortener?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const collection = client.db("linkshortener").collection("links");
    // perform actions on the collection object

    //insert one Item
    /*collection.insertOne({
        "originalURL": "https://www.google.com",
        "shortCode": "abcde",
        "clickCounter": 0,
        "dateCreated": null,
        "adminCode": "randomText"
    });*/

    //search for one Item
    /*collection.findOne({ shortCode: "abcde" }, (err, result) => {
        if (err)
            console.log(err);
        else
            console.log(result);
    });*/
    collection.updateOne()
        //client.close();
    if (err)
        console.log(err);
});