const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.join(__dirname, '../pages'),
    path.join(__dirname, '../components/modals'),
    path.join(__dirname, '../components')
];

let changedFiles = 0;

for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) continue;

    const walk = (d) => {
        let results = [];
        const list = fs.readdirSync(d);
        list.forEach((file) => {
            file = d + '/' + file;
            const stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                results = results.concat(walk(file));
            } else if (file.endsWith('.tsx')) {
                results.push(file);
            }
        });
        return results;
    };

    const files = walk(dir);

    for (const filePath of files) {
        let originalContent = fs.readFileSync(filePath, 'utf-8');
        let content = originalContent;

        // Remove 'uppercase ' or ' uppercase' or 'uppercase' from classNames in <thead> and <th>
        content = content.replace(/(<thead[^>]*className=["'][^"']*)(\buppercase\b)([^"']*["'])/gi, (match, before, upper, after) => {
            let res = before + after;
            res = res.replace(/ {2,}/g, ' '); // Clean up double spaces that might result
            res = res.replace(/ (["'])/g, '$1');
            res = res.replace(/(["']) /g, '$1');
            return res;
        });

        content = content.replace(/(<th[^>]*className=["'][^"']*)(\buppercase\b)([^"']*["'])/gi, (match, before, upper, after) => {
            let res = before + after;
            res = res.replace(/ {2,}/g, ' ');
            res = res.replace(/ (["'])/g, '$1');
            res = res.replace(/(["']) /g, '$1');
            return res;
        });

        // Also fix any other table places like tr text-xs uppercase
        content = content.replace(/className=(["'][^"']*)(\buppercase\b)([^"']*["'])/gi, (match, before, upper, after) => {
            // Only if it's near table tags or th, td. Actually let's just remove 'uppercase' generally for 'text-xs uppercase bg-gray-50' classes usually associated with tables
            if (before.includes('text-xs') || after.includes('bg-gray')) {
                let res = 'className=' + before + after;
                res = res.replace(/ {2,}/g, ' ');
                res = res.replace(/ (["'])/g, '$1');
                res = res.replace(/(["']) /g, '$1');
                return res;
            }
            return match;
        });


        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf-8');
            changedFiles++;
        }
    }
}

console.log(`Updated ${changedFiles} files to remove 'uppercase' class from table headers.`);
