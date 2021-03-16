const length = 4; //define length of our abbreviation 

//function to generate random abbreviation based on url input
function shortenUrl(url) {
    //format our string so it doesn't include https:// and .com
    if (url.includes("/")) {
        url = url.split("/").pop();
    }
    url = url.split(".")[0];

    var shortened = ""; //create variable for our abbreviation
    for (var i = 0; i < length; i++) {
        var randomBoolean = Math.random() < 0.5; //generate random boolean to decide wether to use UpperCase or not
        if (randomBoolean) {
            //add random letter from root url to our shortened version
            shortened = shortened + url.charAt(Math.floor(Math.random() * url.length)).toUpperCase();
        } else {
            shortened = shortened + url.charAt(Math.floor(Math.random() * url.length));
        }
    }
    return shortened;
}

var input = "https://google.com";
console.log(shortenUrl(input));