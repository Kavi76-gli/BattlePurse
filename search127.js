const fs = require("fs");
const path = require("path");

function searchFolder(folder) {
  const files = fs.readdirSync(folder);
  files.forEach(file => {
    const fullPath = path.join(folder, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchFolder(fullPath);
    } else if (stat.isFile()) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (content.includes("127.0.0.1")) {
        console.log(fullPath);
      }
    }
  });
}

searchFolder(__dirname);
