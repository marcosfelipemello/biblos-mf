const fs = require("fs");
const path = require("path");

const biblePath = path.join(__dirname, "src/data/bible.json");

try {
  let data = fs.readFileSync(biblePath, "utf8");
  // Strip BOM
  if (data.charCodeAt(0) === 0xfeff) {
    data = data.slice(1);
  }
  const bible = JSON.parse(data);
  const abbrevs = bible.map((b) => b.abbrev);
  console.log("Total books:", abbrevs.length);
  console.log("Books:", abbrevs.join(", "));

  if (abbrevs.includes("job")) {
    console.log("JOB FOUND");
  } else {
    console.log("JOB NOT FOUND");
  }
} catch (err) {
  console.error(err);
}
