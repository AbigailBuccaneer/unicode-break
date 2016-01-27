/* jshint node: true */
"use strict";

/**
 * A character used to represent invalid Unicode data
 * @type {number}
 */
var replacementCharacter = 0xFFFD;

/**
 * The (half-open) range of UTF-16 leading surrogate code units
 * @type {number[]}
 */
var leadingSurrogate = [0xD800, 0xDC00];

/**
 * The (half-open) range of UTF-16 trailing surrogate code units
 * @type {number[]}
 */
var trailingSurrogate = [0xDC00, 0xE000];

/**
 * Returns whether the code unit is in the given (half-open) range
 * @param range {number[]}
 * @param codeunit {number}
 * @returns {boolean}
 */
function inRange(range, codeunit) {
    return range[0] <= codeunit && codeunit < range[1];
}

/**
 * Given two surrogate code units, return the first code point they represent
 * @param leading {number}
 * @param trailing {number}
 * @returns {number}
 */
function combineSurrogateCodeUnits(leading, trailing) {
    if (inRange(leadingSurrogate, leading)) {
        if (inRange(trailingSurrogate, trailing)) {
            return 0x10000 +
                (leading - leadingSurrogate[0]) * (1 << 10) +
                (trailing - trailingSurrogate[0]);
        }
        else {
            return replacementCharacter;
        }
    }
    else if (inRange(trailingSurrogate, leading)) {
        return replacementCharacter;
    }
    else {
        return leading;
    }
}

/**
 * Given a string and an index, return the first code point represented by the code units starting from index
 * @param str {String}
 * @param index {number}
 * @returns {number}
 */
function codepointAt(str, index) {
    return combineSurrogateCodeUnits(str.charCodeAt(index), str.charCodeAt(index + 1));
}

/**
 * Return the string that the given code point represents
 * @param codepoint
 * @returns {string}
 */
function fromCodepoint(codepoint) {
    if (inRange(leadingSurrogate, codepoint) || inRange(trailingSurrogate, codepoint)) {
        codepoint = replacementCharacter;
    }

    if (codepoint >= 0x10000) {
        codepoint -= 0x10000;
        var leading = leadingSurrogate[0] + (codepoint >> 10);
        var trailing = trailingSurrogate[0] + codepoint;
        return String.fromCharCode(leading) + String.fromCharCode(trailing);
    }
    else if (codepoint >= 0) {
        return String.fromCharCode(codepoint);
    }
    else {
        return String.fromCharCode(replacementCharacter);
    }
}

/**
 * Split the given string into code points
 * @param str
 * @returns {Array}
 */
function splitByCodepoints(str) {
    var arr = [];

    for (var i = 0; i < str.length; ++str) {
        var codepoint = codepointAt(str, i);
        if (codepoint >= 0x10000) {
            arr.push(str.substr(i++, 2));
        }
        else if (codepoint >= 0) {
            arr.push(String.fromCharCode(codepoint));
        }
        else {
            break;
        }
    }

    return arr;
}

module.exports = {
  codepointAt: codepointAt,
  fromCodepoint: fromCodepoint,
  splitByCodepoints: splitByCodepoints
};
