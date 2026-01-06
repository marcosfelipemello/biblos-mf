import fs from "fs";
const data = JSON.parse(fs.readFileSync("./src/data/bible.json", "utf8"));

let results = [];
const search = "getse";

data.forEach((book) => {
  book.chapters.forEach((chapter) => {
    chapter.forEach((verse) => {
      if (verse.toLowerCase().includes(search)) {
        results.push(verse);
      }
    });
  });
});

console.log("Found matches:", results.length);
if (results.length > 0) console.log(results[0]);
