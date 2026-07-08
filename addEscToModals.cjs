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

allFiles.forEach(f => {
    let text = fs.readFileSync(f, 'utf-8');
    let changed = false;

    // Pattern to match Modal components taking an inline object containing onClose
    // Examples:
    // const XModal = ({ isOpen, onClose }) => {
    // const YModal: React.FC<Props> = ({ item, onClose }) => {
    const regex = /(const\s+[a-zA-Z0-9_]*Modal[\s\w:<>\.\n]*=\s*(?:async\s*)?\(\s*(?:\{\s*([^}]+)\s*\})\s*(?::\s*[^)]+)?\)\s*=>\s*\{(?:\s*\n)?)/g;

    text = text.replace(regex, (match, prefix, args) => {
        if (!args || !args.includes('onClose')) {
            return match; // Needs an onClose handler
        }

        let condition = 'true';
        if (args.includes('isOpen')) condition = 'isOpen';
        else if (args.includes('item')) condition = 'item';
        else if (args.includes('product')) condition = 'product';
        else if (args.includes('member')) condition = 'member';
        else if (args.includes('transaction')) condition = 'transaction';
        else if (args.includes('voucher')) condition = 'voucher';

        // Check lookahead
        const matchIndex = text.indexOf(match);
        if (matchIndex === -1) return match;
        const lookahead = text.substring(matchIndex, matchIndex + 300);
        if (lookahead.includes('Escape') || lookahead.includes('handleEsc')) {
            return match; // Already has it
        }

        const depArray = `[${condition}, onClose]`;

        changed = true;
        return `${prefix}    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        ${condition !== 'true' ? `if (${condition}) window.addEventListener('keydown', handleEsc);` : `window.addEventListener('keydown', handleEsc);`}
        return () => window.removeEventListener('keydown', handleEsc);
    }, ${depArray});
`;
    });

    if (changed) {
        fs.writeFileSync(f, text, 'utf-8');
        console.log(`Updated ${f}`);
    }
});
