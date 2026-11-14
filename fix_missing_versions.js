const fs = require('fs');
const path = require('path');

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                walk(fullPath);
            }
        } else if (file === 'package.json') {
            try {
                const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                if (typeof pkg.version !== 'string') {
                    console.log('Missing version field in:', fullPath);
                    // Automatically fix it
                    pkg.version = "0.0.0";
                    fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2));
                    console.log('Fixed:', fullPath);
                }
            } catch(e) {}
        }
    }
}

walk('.');
