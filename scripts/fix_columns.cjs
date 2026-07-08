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

        const allColKeysMatch = content.match(/const\s+allColumns(?:[\s\S]*?)=([\s\S]*?)\];/);
        if (allColKeysMatch) {
            const keysText = allColKeysMatch[1];
            const keyMatches = [...keysText.matchAll(/key:\s*(['"])(.*?)\1/g)];
            const allKeys = keyMatches.map(m => m[2]);

            if (allKeys.length > 0) {
                // specific regex for visibleColumns
                content = content.replace(/((?:const|let)\s+\[visibleColumns\s*,\s*setVisibleColumns\]\s*=\s*useState(?:<[^>]+>)?\s*\()([^)]*)(\))/g, `const [visibleColumns, setVisibleColumns] = useState(${JSON.stringify(allKeys)})`);
            }
        }

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf-8');
            changedFiles++;
        }
    }
}

console.log(`Updated ${changedFiles} files with default column visibility again.`);
