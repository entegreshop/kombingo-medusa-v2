const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../node_modules/@medusajs/dashboard/dist/app.js');
console.log(`Searching file: ${filePath}`);
if (fs.existsSync(filePath)) {
  const content = fs.readFileSync(filePath, 'utf8');
  const index = content.indexOf('Gutter =');
  if (index !== -1) {
    console.log(content.slice(index - 200, index + 800));
  } else {
    const index2 = content.indexOf('var Gutter =');
    if (index2 !== -1) {
      console.log(content.slice(index2 - 200, index2 + 800));
    } else {
      console.log("Gutter component not found");
    }
  }
} else {
  console.log("File not found");
}
