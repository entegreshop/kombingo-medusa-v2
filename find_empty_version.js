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
                if (pkg.version === '') {
                    console.log('Empty top-level version in:', fullPath);
                }
                const deps = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies', 'resolutions', 'overrides'];
                for (const depType of deps) {
                    if (pkg[depType]) {
                        for (const [k, v] of Object.entries(pkg[depType])) {
                            if (v === '' || v === 'npm:null@*') {
                                console.log(`Empty or invalid version in ${fullPath} for ${depType}.${k}: "${v}"`);
                            }
                        }
                    }
                }
            } catch(e) {}
        }
    }
}

walk('.');
