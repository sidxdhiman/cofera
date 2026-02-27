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

    content = content.replace(/bg-darkHover/g, 'bg-surfaceHover');
    content = content.replace(/bg-dark/g, 'bg-surface');
    content = content.replace(/text-white/g, 'text-text');
    content = content.replace(/text-gray-400/g, 'text-textSecondary');
    content = content.replace(/text-gray-500/g, 'text-textSecondary');
    content = content.replace(/border-gray-500/g, 'border-border');
    content = content.replace(/border-darkHover/g, 'border-border');
    content = content.replace(/text-black/g, 'text-white dark:text-surface');
    // Replace rounded-md with rounded-xl for material feel in some places? Maybe let's leave rounded-md for now.

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
    }
});

console.log('Done refactoring classes.');
