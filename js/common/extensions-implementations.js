"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapTransform = exports.initOnce = exports.ExcludeIfDefault = exports.Default = void 0;
const class_transformer_1 = require("class-transformer");
// Array prototype extensions implementation ------------------------------------------------------------
Array.prototype.findDeep = function (keyToFind, valToFind) {
    let foundObj;
    JSON.stringify(this, (_, nestedValue) => {
        if (nestedValue && nestedValue[keyToFind] === valToFind) {
            foundObj = nestedValue;
        }
        return nestedValue;
    });
    return foundObj;
};
Array.prototype.includesIgnoreCase = function (value, propName) {
    if (typeof value === 'string') {
        return this.some(item => typeof item === 'string' && item.toLowerCase() === value.toLowerCase());
    }
    else if (typeof value === 'object') {
        if (propName) {
            return this.some(item => item[propName] && item[propName].toString().toLowerCase() === value[propName].toString().toLowerCase());
        }
        return this.includes(value);
    }
    return false;
};
Array.prototype.replace = function (target, predicate, replaceCallback) {
    if (Array.isArray(target)) {
        return this && this.map(source => {
            let outputTarget = target.find(target => predicate(source, target)) || source;
            if (replaceCallback) {
                outputTarget = replaceCallback(source, outputTarget);
            }
            return outputTarget;
        });
    }
    return this && this.map(source => {
        let outputTarget = predicate(source, target) ? target : source;
        if (replaceCallback) {
            outputTarget = replaceCallback(source, outputTarget);
        }
        return outputTarget;
    });
};
Array.prototype.removeByProps = function (props) {
    const keys = Object.keys(props);
    this.forEach((item, index) => {
        if (keys.every((key) => item[key] === props[key])) {
            this.splice(index, 1);
        }
    });
    return this;
};
Array.prototype.remove = function (predicate) {
    let i = this.length;
    while (i--) {
        if (predicate(this[i], i)) {
            this.splice(i, 1);
        }
    }
    return this;
};
Array.prototype.excludeBy = function (target, sourceKeyProperty, targetKeyProperty) {
    if (!target) {
        return this;
    }
    const keys = [].concat(target).map(object => String(object[targetKeyProperty]));
    return this.filter(object => !keys.includes(String(object[sourceKeyProperty])));
};
Array.prototype.exclude = function (target, predicate) {
    if (Array.isArray(target)) {
        return this && this.filter(source => !target.some(target => predicate(source, target)));
    }
    return this && this.filter(source => !predicate(source, target));
};
Array.prototype.sortBy = function (prop, isAsc = true) {
    return this.sort((a, b) => {
        return (a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0) * (isAsc ? 1 : -1);
    });
};
Array.prototype.sortByKey = function (key, order = 'asc', topKeys = [], bottomKeys = []) {
    this.sort((a, b) => {
        if (a[key] < b[key])
            return order === 'asc' ? -1 : 1;
        if (a[key] > b[key])
            return order === 'asc' ? 1 : -1;
        return 0;
    });
    topKeys.reverse().forEach(topKey => {
        const index = this.findIndex(item => item[key] === topKey);
        if (index > -1) {
            const item = this.splice(index, 1)[0];
            this.unshift(item);
        }
    });
    bottomKeys.forEach(bottomKey => {
        const index = this.findIndex(item => item[key] === bottomKey);
        if (index > -1) {
            const item = this.splice(index, 1)[0];
            this.push(item);
        }
    });
    return this;
};
Array.prototype.first = function (predicate, defaultValue) {
    for (let i = 0; i < this.length; i++) {
        if (predicate(this[i], i, this)) {
            return this[i];
        }
    }
    return defaultValue;
};
Array.prototype.last = function (predicate, defaultValue) {
    for (let i = this.length - 1; i >= 0; i--) {
        if (predicate(this[i], i, this)) {
            return this[i];
        }
    }
    return defaultValue;
};
Array.prototype.toMap = function (keyCb, valueCb) {
    return this.reduce((map, item) => {
        map.set(keyCb(item), valueCb(item));
        return map;
    }, new Map());
};
Array.prototype.innerJoin = function (target, comparator, selector) {
    return this.reduce((prev, source) => {
        target.forEach(tgt => {
            if (comparator(source, tgt))
                prev.push(selector(source, tgt));
        });
        return prev;
    }, []);
};
Array.prototype.leftJoin = function (target, comparator, selector) {
    return this.reduce((prev, source) => {
        let found = false;
        target.forEach(tgt => {
            if (comparator(source, tgt)) {
                prev.push(selector(source, tgt));
                found = true;
            }
        });
        if (!found)
            prev.push(selector(source, null));
        return prev;
    }, []);
};
Array.prototype.rightJoin = function (target, comparator, selector) {
    return target.reduce((prev, tgt) => {
        let found = false;
        this.forEach(source => {
            if (comparator(source, tgt)) {
                prev.push(selector(source, tgt));
                found = true;
            }
        });
        if (!found)
            prev.push(selector(null, tgt));
        return prev;
    }, []);
};
Array.prototype.crossJoin = function (target, selector) {
    return this.reduce((prev, source) => {
        target.forEach(tgt => {
            prev.push(selector(source, tgt));
        });
        return prev;
    }, []);
};
Array.prototype.fullJoin = function (target, comparator, selector) {
    const result = [];
    const sourceMatched = new Array(this.length).fill(false);
    const targetMatched = new Array(target.length).fill(false);
    for (let sourceIndex = 0; sourceIndex < this.length; sourceIndex++) {
        for (let targetIndex = 0; targetIndex < target.length; targetIndex++) {
            if (comparator(this[sourceIndex], target[targetIndex])) {
                result.push(selector(this[sourceIndex], target[targetIndex]));
                sourceMatched[sourceIndex] = true;
                targetMatched[targetIndex] = true;
            }
        }
    }
    for (let sourceIndex = 0; sourceIndex < this.length; sourceIndex++) {
        if (!sourceMatched[sourceIndex]) {
            result.push(selector(this[sourceIndex], null));
        }
    }
    for (let targetIndex = 0; targetIndex < target.length; targetIndex++) {
        if (!targetMatched[targetIndex]) {
            result.push(selector(null, target[targetIndex]));
        }
    }
    return result;
};
Array.prototype.sum = function (callback) {
    return this.reduce((acc, curr) => acc + callback(curr), 0);
};
Array.prototype.distinct = function (prop) {
    return this && [...new Map(this.map(item => {
            if (prop && (typeof item == 'object'))
                return [item[prop], item];
            return [item, item];
        })).values()];
};
Array.prototype.offset = function (number) {
    return this && this.slice(number);
};
Array.prototype.take = function (number) {
    return this && this.slice(0, number);
};
Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
    return this;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
Array.prototype.flatBy = function (flatByProp, _classType) {
    return this.reduce((result, parent) => {
        const children = parent[flatByProp];
        if (Array.isArray(children)) {
            return [...result, ...children];
        }
        return result;
    }, []);
};
Array.prototype.groupByProp = function (groupByProperty, groupKeyProperty, groupArrayProperty) {
    const groupMap = new Map();
    for (const obj of this) {
        const key = obj[groupByProperty];
        if (!groupMap.has(key)) {
            groupMap.set(key, []);
        }
        const group = groupMap.get(key);
        group === null || group === void 0 ? void 0 : group.push({ ...obj });
    }
    const groupedArray = Array.from(groupMap.entries()).map(([key, values]) => ({
        [groupKeyProperty]: key,
        [groupArrayProperty]: values,
    }));
    return groupedArray.sort((a, b) => (a[groupKeyProperty] > b[groupKeyProperty]) ? 1 : -1);
};
// String prototype extensions implementation ------------------------------------------------------------
String.prototype.format = function (...args) {
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match;
    });
};
String.prototype.normalizeFilename = function () {
    let ext = '';
    const extIndex = this.lastIndexOf('.');
    if (extIndex !== -1) {
        ext = this.substring(extIndex);
    }
    let filename = ext ? this.substring(0, extIndex) : this;
    filename = filename.replace(/[^a-zA-Z0-9_.-]/g, '-');
    return filename + ext;
};
String.prototype.replaceStrings = function (...replacements) {
    let result = this;
    for (const replacement of replacements) {
        const from = RegExp(replacement.toRegex ? replacement.toRegex : RegExp.escape(replacement.from), replacement.firstOnly ? '' : 'g');
        result = result.replace(from, replacement.to);
    }
    return result;
};
String.prototype.trimEnd = function (charToTrim) {
    if (!this) {
        return this;
    }
    if (!charToTrim) {
        return this.replace(/\s+$/, ''); // Default behavior for spaces
    }
    const regex = new RegExp(`${charToTrim}+$`);
    return this.replace(regex, '');
};
String.prototype.trimStart = function (charToTrim) {
    if (!this) {
        return this;
    }
    if (!charToTrim) {
        return this.replace(/^\s+/, ''); // Default behavior for spaces
    }
    const regex = new RegExp(`^${charToTrim}+`);
    return this.replace(regex, '');
};
// RegExp extensions implementation ------------------------------------------------------------
RegExp.escape = function (rawExpression) {
    return rawExpression.replace(/[\^$.*+?()[{\\]/g, '\\$&');
};
// Decorators implementation ------------------------------------------------------------
/**
 *  Decorator for class properties to initialize property value with default value if it's null or undefined.
 * @param defaultValue - The default value to initialize with.
 * */
function Default(defaultValue) {
    return (0, class_transformer_1.Transform)(({ value }) => {
        if (value !== null && value !== undefined)
            return value;
        if (typeof defaultValue === 'function')
            return defaultValue();
        if (Array.isArray(defaultValue))
            return [...defaultValue];
        if (typeof defaultValue === 'object') {
            return (defaultValue === null) ? null : { ...defaultValue };
        }
        return defaultValue;
    });
}
exports.Default = Default;
/**
 *  Decorator for class properties to exclude property from serialization if it's value equals to default value.
 * @param defaultValue - The default value to compare to.
 * */
function ExcludeIfDefault(defaultValue) {
    return (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof defaultValue != 'undefined'
            && (typeof value != 'object' && value == defaultValue
                || typeof value == 'object' && JSON.stringify(value) == JSON.stringify(defaultValue))) {
            return undefined;
        }
        return value;
    });
}
exports.ExcludeIfDefault = ExcludeIfDefault;
/**
 * Decorator to lazy initialize property value once.
 *
 * Example:
 *
 * ```js
 * \@initOnce()
 * languageSwitcherSource = () => this.$app.appConfig.locales;
 * ```
 * This will initialize the `languageSwitcherSource` property once with the result
 * of the callback function returning locales from `appConfig` when this
 * property is accessed for the first time.
 *
 * @returns
 */
function initOnce() {
    return function (target, propertyKey) {
        let _value;
        Object.defineProperty(target, propertyKey, {
            get: function () {
                if (typeof _value === 'function') {
                    _value = _value.call(this);
                }
                return _value;
            },
            set: function (newVal) {
                _value = newVal;
            },
            configurable: true,
            enumerable: true
        });
    };
}
exports.initOnce = initOnce;
/**
 *  Method to convert plain map to class map.
 *  Used with class-transformer \@Transform decorator.
 * @param value
 * @param classType
 * @returns
 */
function mapTransform(classType, value) {
    const objectsMap = new Map();
    if (value && value.obj && value.obj.objectsMap instanceof Map) {
        for (const entry of value.obj.objectsMap.entries()) {
            objectsMap.set(entry[0], (0, class_transformer_1.plainToInstance)(classType, entry[1]));
        }
    }
    return objectsMap;
}
exports.mapTransform = mapTransform;
//# sourceMappingURL=extensions-implementations.js.map