/**
 * Utility to convert numbers to Vietnamese words.
 */

const defaultNumbers = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

function readThreeDigits(n: number, showZeroHundred: boolean): string {
    let res = "";
    const hundred = Math.floor(n / 100);
    const ten = Math.floor((n % 100) / 10);
    const unit = n % 10;

    if (hundred > 0 || showZeroHundred) {
        res += defaultNumbers[hundred] + " trăm ";
    }

    if (ten > 0) {
        if (ten === 1) {
            res += "mười ";
        } else {
            res += defaultNumbers[ten] + " mươi ";
        }
    } else if (showZeroHundred || (hundred > 0 && unit !== 0)) {
        res += "lẻ ";
    }

    if (unit > 0) {
        if (unit === 1 && ten > 1) {
            res += "mốt";
        } else if (unit === 5 && ten > 0) {
            res += "lăm";
        } else if (unit === 4 && ten > 1) {
            res += "tư";
        } else {
            res += defaultNumbers[unit];
        }
    }

    return res.trim();
}

export function numberToWords(n: number): string {
    if (n === 0) return "Không đồng";
    if (n < 0) return "Trừ " + numberToWords(Math.abs(n));

    let res = "";
    const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ", "tỷ tỷ"];

    let temp = n;
    const groups: number[] = [];

    while (temp > 0) {
        groups.push(temp % 1000);
        temp = Math.floor(temp / 1000);
    }

    for (let i = groups.length - 1; i >= 0; i--) {
        const groupValue = groups[i];
        if (groupValue > 0) {
            // Show "không trăm" if it's not the first group and there are higher groups
            const showZeroHundred = i < groups.length - 1;
            const groupText = readThreeDigits(groupValue, showZeroHundred);
            res += groupText + " " + units[i] + " ";
        }
    }

    res = res.trim();
    if (!res) return "Không đồng";

    // Capitalize first letter
    res = res.charAt(0).toUpperCase() + res.slice(1);

    return res + " đồng chẵn";
}
