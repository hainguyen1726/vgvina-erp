const fs = require('fs');
const path = require('path');

const getFiles = (dir) => {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
};

const allFiles = [...getFiles('pages'), ...getFiles('components/modals')];
const needsUpdate = [];

allFiles.forEach(f => {
    const text = fs.readFileSync(f, 'utf-8');
    // If the file defines a modal component but doesn't have an "Escape" check
    if (text.includes('Modal') && !text.includes('Escape')) {
        needsUpdate.push(f);
    }
});
console.log(needsUpdate.join('\n'));
