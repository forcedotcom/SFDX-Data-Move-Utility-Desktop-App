/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */


var CONSTANTS = {
    // TODO:
};

if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

$.fn.formToJSON = function() {
    if ($(this).length == 0) return {};
    var data = $(this).serializeArray();
    return data.reduce(function(out, value) {
        out[value['name']] = value['value'];
        return out;
    }, {});
}

function getDeep(obj, prop) {
    if (typeof obj === 'undefined') {
        return false;
    }
    var _index = prop.indexOf('.')
    if (_index > -1) {
        return getDeep(obj[prop.substring(0, _index)], prop.substr(_index + 1));
    }
    return obj[prop];
}

function setDeep(obj, prop, value) {
    prop = prop.replace('[', '').replace(']', '');
    const pList = prop.split('.');
    const key = pList.pop();
    const pointer = pList.reduce((accumulator, currentValue) => {
        if (accumulator[currentValue] === undefined) accumulator[currentValue] = {};
        return accumulator[currentValue];
    }, obj);
    pointer[key] = value;
    return obj;
}

function buildNestedObjectsList(sourceArray, itemsPropertyName, accum) {

    accum = accum || [];

    if (sourceArray[itemsPropertyName]) {
        sourceArray[itemsPropertyName].forEach(function(obj) {
            accum.push(obj);
        });
    } else {
        Object.getOwnPropertyNames(sourceArray).forEach(function(gname) {
            buildNestedObjectsList(sourceArray[gname], itemsPropertyName, accum);
        });
    }

    return accum;
}

/*

var people = [
  { name: 'Alice', age: 21 },
  { name: 'Max', age: 20 },
  { name: 'Jane', age: 20 }
];

// { 
//   20: [
//     { name: 'Max', age: 20 }, 
//     { name: 'Jane', age: 20 }
//   ], 
//   21: [{ name: 'Alice', age: 21 }] 
// }
*/

function groupBy(array, groupByProperty) {
    return array.reduce(function(acc, obj) {
        var key = obj[groupByProperty];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});
}

function groupBy2(array, groupByProperty, outGroupFieldName, outGroupDataFieldName) {
    var o;
    var o1 = {};
    return array.reduce(function(acc, obj) {
        var key = getDeep(obj, groupByProperty);
        if (!o1[key]) {
            o = {};
            o[outGroupFieldName] = key;
            o[outGroupDataFieldName] = [];
            acc.push(o);
            o1[key] = o;
        } else {
            o = o1[key];
        }
        o[outGroupDataFieldName].push(obj);
        return acc;
    }, []);
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


// Warn if overriding existing method
if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function(array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        } else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", { enumerable: false });

function objectToQuerystring(obj) {
    return Object.keys(obj).reduce(function(str, key, i) {
        var delimiter, val;
        delimiter = (i === 0) ? '?' : '&';
        key = encodeURIComponent(key);
        val = encodeURIComponent(obj[key]);
        return [str, delimiter, key, '=', val].join('');
    }, '');
}


function readSingleFile(e) {

    var dfd = jQuery.Deferred();
    var file = e.target.files[0];

    if (!file) {
        dfd.resolve();
        return;
    }

    var reader = new FileReader();

    reader.onload = function(e) {
        var contents = e.target.result;
        dfd.resolve(contents);
    };

    reader.readAsText(file);

    return dfd.promise();
}

var orderBy = (function() {

    var toString = Object.prototype.toString,
        // default parser function
        parse = function(x) { return x; },
        // gets the item to be sorted
        getItem = function(x) {
            var isObject = x != null && typeof x === "object";
            var isProp = isObject && this.prop in x;
            return this.parser(isProp ? x[this.prop] : x);
        };

    /**
     * Sorts an array of elements.
     *
     * @param  {Array} array: the collection to sort
     * @param  {Object} cfg: the configuration options
     * @property {String}   cfg.prop: property name (if it is an Array of objects)
     * @property {Boolean}  cfg.desc: determines whether the sort is descending
     * @property {Function} cfg.parser: function to parse the items to expected type
     * @return {Array}
     */
    return function orderBy(array, cfg) {
        if (!(array instanceof Array && array.length)) return [];
        if (toString.call(cfg) !== "[object Object]") cfg = {};
        if (typeof cfg.parser !== "function") cfg.parser = parse;
        cfg.desc = cfg.desc ? -1 : 1;
        return array.sort(function(a, b) {
            a = getItem.call(cfg, a);
            b = getItem.call(cfg, b);
            return cfg.desc * (a < b ? -1 : +(a > b));
        });
    };

}());