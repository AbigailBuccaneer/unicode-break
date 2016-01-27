/* jshint node: true */
"use strict";

module.exports = {};

function merge(modulename) {
    var exports = require(modulename);
    for (var name in exports) {
        module.exports[name] = exports[name];
    }
}

merge('codepoints');
