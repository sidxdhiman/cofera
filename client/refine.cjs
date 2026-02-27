const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Enhance Inputs
    content = content.replace(/outline-none/g, 'outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all');

    // Auth and Leave Modals
    content = content.replace(/bg-black\/50 p-4/g, 'bg-black/40 backdrop-blur-sm p-4 sm:p-8');
    content = content.replace(/rounded-lg bg-surface p-6/g, 'rounded-2xl bg-surface p-8');

    // Better general rounding
    content = content.replace(/rounded-md/g, 'rounded-xl');

    // Button Hover Effects
    content = content.replace(/bg-primary px-8/g, 'bg-primary hover:bg-primaryHover hover:shadow-google transition-all px-8');
    content = content.replace(/bg-primary px-4/g, 'bg-primary hover:bg-primaryHover hover:shadow-google transition-all px-4');

    // Text colors in Leave Modal
    content = content.replace(/text-gray-300/g, 'text-textSecondary');
    content = content.replace(/hover:decoration-white/g, 'hover:decoration-text');
    content = content.replace(/hover:bg-red-500/g, 'hover:bg-danger hover:text-white');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Refined:', file);
    }
});

console.log('Done refining classes.');
