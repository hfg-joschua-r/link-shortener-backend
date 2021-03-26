var fs = require("fs");

fs.writeFile("./test.txt", "helloWorld".repeat(2000), () => {
    console.log("we ready");
});