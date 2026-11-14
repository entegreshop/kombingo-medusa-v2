const fs = require('fs');
const path = require('path');

const filepath = 'c:/Users/Asus/Desktop/XOOX Medusa V2 Project/XOOX Medusa V2 Project/apps/storefront/src/modules/checkout/templates/single-page-checkout/index.tsx';

if (fs.existsSync(filepath)) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');
  
  console.log("--- SEARCH RESULTS FOR 'metadata' OR 'payment' ---");
  lines.forEach((line, idx) => {
    if (line.includes('metadata') || line.includes('place') || line.includes('completed') || line.includes('cart') || line.includes('payment_method')) {
      if (line.length < 120) {
        console.log(`${idx + 1}: ${line.trim()}`);
      }
    }
  });
} else {
  console.log("File not found");
}
