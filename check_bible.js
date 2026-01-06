const fs = require("fs");
const path = require("path");

const biblePath = path.join(__dirname, "src/data/bible.json");

try {
  const data = fs.readFileSync(biblePath, "utf8");
  const bible = JSON.parse(data);
  const abbrevs = bible.map((b) => b.abbrev);
  console.log("Total books:", abbrevs.length);
  console.log("Books:", abbrevs.join(", "));

  if (abbrevs.includes("job")) {
    console.log("JOB FOUND");
  } else {
    console.log("JOB NOT FOUND");
    // Check for similar
    const similar = abbrevs.find((a) => a.startsWith("j") || a.includes("o"));
    console.log("Possible candidates:", similar);
  }
} catch (err) {
  console.error(err);
}
