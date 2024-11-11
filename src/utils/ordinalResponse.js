import numberToOrdinal from './ordinal.js';

const ordinalResponses = ['Current', 'Next', 'Third', 'Fourth', 'Fifth'];

function numberToOrdinalResponse(n) {
    if (n >= 0 && n < ordinalResponses.length) {
        return ordinalResponses[n];
    } else if (n >= ordinalResponses.length) {
        return numberToOrdinal(n + 1);
    } else {
        throw new Error('Number out of range. This function only supports non-negative numbers.');
    }
}

export default numberToOrdinalResponse;
