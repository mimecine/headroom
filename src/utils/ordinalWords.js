const ordinals = [
    'Zeroth',
    'First',
    'Second',
    'Third',
    'Fourth',
    'Fifth',
    'Sixth',
    'Seventh',
    'Eighth',
    'Ninth',
    'Tenth',
    'Eleventh',
    'Twelfth',
    'Thirteenth',
    'Fourteenth',
    'Fifteenth',
    'Sixteenth',
    'Seventeenth',
    'Eighteenth',
    'Nineteenth',
    'Twentieth',
    'Twenty-First',
    'Twenty-Second',
    'Twenty-Third',
    'Twenty-Fourth',
    'Twenty-Fifth',
    'Twenty-Sixth',
    'Twenty-Seventh',
    'Twenty-Eighth',
    'Twenty-Ninth',
    'Thirtieth'
];

function numberToOrdinalWord(n) {
    if (n >= 0 && n <= 30) {
        return ordinals[n];
    } else {
        throw new Error('Number out of range. This function only supports numbers from 0 to 30.');
    }
}

export default numberToOrdinalWord;
