"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonUtils = void 0;
const class_transformer_1 = require("class-transformer");
const common_1 = require("../common");
class CommonUtils {
    /**
    * Generates a random string of the specified length.
    *
    * @param {number} length - The length of the generated string (default: 10).
    * @param {string} prependWith - The character(s) to prepend to the generated string (default: 'a').
    * @returns {string} - The generated random string.
    */
    static randomString(length = 10, prependWith = 'a') {
        let result = prependWith || '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length - result.length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    /**
    * Retrieves the caller information of a function for debugging purposes.
    *
    * @param {Error} [error] - (Optional) The error object to extract the stack trace from.
    * @param {number} [callerLevel=SHARED_CONSTANTS.CALLER_LEVEL.grandParentFunction] - (Optional) The level of the caller in the call stack.
    * @returns {CallerInfo} - The caller information object containing the full stack trace, function name, and line number.
    */
    static getFunctionCaller(error, callerLevel = common_1.CONSTANTS.CALLER_LEVEL.grandParentFunction) {
        const err = error || new Error();
        let frame = err.stack.split("\n")[error ? common_1.CONSTANTS.CALLER_LEVEL.currentFunction : callerLevel];
        frame || (frame = err.stack);
        const lineNumber = +frame.split(":").reverse()[1] || 1;
        let functionName = '';
        if (frame.includes('/')) {
            functionName = frame.split(':').reverse()[2];
            functionName = (functionName || '').split('/').reverse()[0] || 'eval';
        }
        else {
            functionName = frame.split(" ")[5] || 'eval';
        }
        return {
            fullStackTrace: err.stack,
            functionName,
            lineNumber
        };
    }
    /** Parses a rejection into an error string. */
    static parseRejectionIntoErrorString(rejection) {
        if (rejection instanceof Error) {
            return rejection.message;
        }
        if (typeof rejection === 'string') {
            return rejection;
        }
        if (typeof rejection === 'object' && rejection !== null) {
            try {
                return JSON.stringify(rejection, null, 2);
            }
            catch (e) {
                // Catch potential stringification errors, e.g., due to circular references
            }
        }
        return "An unknown error occurred.";
    }
    static shallowClone(object) {
        return JSON.parse(JSON.stringify(object || {}));
    }
    /**
     * Performs a deep equality comparison between two objects.
     *
     * @param {T1} object1 - The first object to compare.
     * @param {T2} object2 - The second object to compare.
     * @param {boolean} [compareByExistInBothProps] - (Optional) Whether to compare by existing properties in both objects.
     * @param {boolean} [treatEmptyStringAndFalseAsUndefined] - (Optional) Whether to treat empty strings and false values as undefined.
     * @returns {boolean} - A boolean indicating whether the two objects are deeply equal.
     */
    static deepEquals(object1, object2, compareByExistInBothProps, treatEmptyStringAndFalseAsUndefined = false) {
        if (typeof object1 === 'object' && object1 != null) {
            if (typeof object2 != 'object' || object2 == null) {
                return false;
            }
            const object1Keys = Object.keys(object1);
            const object2Keys = Object.keys(object2);
            if (!compareByExistInBothProps && object1Keys.length !== object2Keys.length) {
                return false;
            }
            return object1Keys.every(propName => {
                if (compareByExistInBothProps && !object2.hasOwnProperty(propName)) {
                    return true;
                }
                return CommonUtils.deepEquals(object1[propName], object2[propName], compareByExistInBothProps, treatEmptyStringAndFalseAsUndefined);
            });
        }
        if (typeof object1 === 'function' && typeof object2 === 'function') {
            return true;
        }
        if (treatEmptyStringAndFalseAsUndefined) {
            if (!object1 && !object2)
                return true;
        }
        return object1 == object2;
    }
    /**
     *  Initializes an object instance with default values.
     * @param objectToInitialize  The object instance to initialize
     * @param classType  The class type of the object instance
     * @param defaults  The default values to initialize the object instance with
     * @returns  The initialized object instance
     */
    static initializeObject(objectToInitialize, classType, ...defaults) {
        // If objectInstanceToInitialize is null or undefined or is not a object => return objectInstanceToInitialize
        if (objectToInitialize === null
            || objectToInitialize === undefined
            || typeof objectToInitialize !== 'object'
            || Array.isArray(objectToInitialize)
            || objectToInitialize instanceof Map) {
            return objectToInitialize;
        }
        // Create a new instance of T using default constructor of T
        const defaultValues = new classType();
        // Copy each property which is not undefined from defaultValues to the respective property of the result
        for (const prop in defaultValues) {
            if (defaultValues[prop] !== undefined && objectToInitialize[prop] === undefined) {
                objectToInitialize[prop] = defaultValues[prop];
            }
        }
        // If defaults[] is provided
        defaults.forEach(defaultObj => {
            Object.keys(defaultObj).forEach(key => {
                // If property is undefined in result and not undefined in defaultObj
                if (objectToInitialize[key] === undefined && defaultObj[key] !== undefined) {
                    // We override the property
                    objectToInitialize[key] = defaultObj[key];
                }
            });
        });
        // We cast back to T before returning
        return objectToInitialize;
    }
    /**
     * Clones an object instance.
     * @param objectToClone  The object instance to clone
     * @param classType  The class type of the object instance
     * @param options  The class transform options
     * @returns  The cloned object instance
     */
    static cloneClassInstance(objectToClone, classType, options) {
        const clonedObject = (0, class_transformer_1.instanceToPlain)(objectToClone, options);
        return (0, class_transformer_1.plainToInstance)(classType, clonedObject, options);
    }
    /**
    *  Deep clones an object instance.
    * @param object  The object instance to clone
    * @returns  The cloned object instance
    */
    static deepClone(object) {
        if (object === null || typeof object !== 'object')
            return object;
        const clonedObject = Object.create(Object.getPrototypeOf(object), Object.getOwnPropertyDescriptors(object));
        for (const key of Reflect.ownKeys(clonedObject)) {
            const value = clonedObject[key];
            if (value && typeof value === 'object') {
                clonedObject[key] = CommonUtils.deepClone(value);
            }
        }
        return clonedObject;
    }
    /**
     * Shallow clones an object instance.
     * @param object  The object instance to clone
     * @returns  The cloned object instance
     */
    static clone(object) {
        if (object === null || typeof object !== 'object')
            return object;
        const clonedObject = Object.create(Object.getPrototypeOf(object), Object.getOwnPropertyDescriptors(object));
        return clonedObject;
    }
    /**
    * Safely converts an object to a string representation, handling circular references.
    *
    * @param {any} obj - The object to stringify.
    * @returns {string} - The string representation of the object.
    */
    static stringifySafe(obj) {
        const replacer = () => {
            const cache = new WeakSet();
            return (_key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (cache.has(value)) {
                        return;
                    }
                    cache.add(value);
                }
                return value;
            };
        };
        return JSON.stringify(obj, replacer());
    }
    /**
        * Recursively assigns defined properties from multiple sources to a target object.
        *
        * @param {any} target - The target object to assign properties to.
        * @param {...any[]} sources - The sources containing properties to assign.
        * @returns {any} - The target object with assigned properties.
        */
    static assignDefinedDeep(target, ...sources) {
        if (sources == null || sources == undefined)
            return target;
        sources.forEach((source) => {
            if (source != null && source != undefined) {
                Object.keys(source).forEach((key) => {
                    const value = source[key];
                    if (value != undefined) {
                        if (typeof value === 'object' &&
                            !Array.isArray(value) &&
                            typeof target[key] === 'object' &&
                            !Array.isArray(target[key])) {
                            CommonUtils.assignDefinedDeep(target[key], value);
                        }
                        else {
                            target[key] = value;
                        }
                    }
                });
            }
        });
        return target;
    }
    /**
     * Assigns undefined properties from multiple sources to a target object.
     *
     * @param {any} target - The target object to assign properties to.
     * @param {...any[]} sources - The sources containing properties to assign.
     * @returns {any} - The target object with assigned properties.
     */
    static assignUndefined(target, ...sources) {
        if (!target) {
            target = {};
        }
        sources = sources || [];
        sources.forEach(source => {
            source = source || {};
            Object.keys(source).forEach(key => {
                if (target[key] === undefined) {
                    target[key] = source[key];
                }
            });
        });
        return target;
    }
    /**
     * Returns a string representing the time elapsed since a specified date.
     *
     * @param {Date} date - The date to calculate the time ago from.
     * @param {string} langCode - The language code specifying the language for the time ago string.
     * @param {number} [maxDays=30] - The maximum number of days to display in the time ago string (default: 30).
     * @returns {string} - The time ago string.
     */
    static timeAgo(date, langCode, maxDays = 30) {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        const languageMap = {
            en: ['{0} seconds ago', '{0} minutes ago', '{0} hours ago', '{0} days ago'],
            de: ['{0} Sekunden vor', '{0} Minuten vor', '{0} Stunden vor', '{0} Tage vor'],
            it: ['{0} secondi fa', '{0} minuti fa', '{0} ore fa', '{0} giorni fa'],
            fr: ['{0} secondes auparavant', '{0} minutes auparavant', '{0} heures auparavant', '{0} jours auparavant'],
            ar: ['منذ {0} ثواني', 'منذ {0} دقائق', 'منذ {0} ساعات', 'منذ {0} أيام'],
            he: ['לפני {0} שניות', 'לפני {0} דקות', 'לפני {0} שעות', 'לפני {0} ימים'],
            es: ['hace {0} segundos', 'hace {0} minutos', 'hace {0} horas', 'hace {0} días'],
            zh: ['{0}秒前', '{0}分钟前', '{0}小时前', '{0}天前'],
            hi: ['{0} सेकंड पहले', '{0} मिनट पहले', '{0} घंटे पहले', '{0} दिन पहले'],
            ru: ['{0} секунд назад', '{0} минут назад', '{0} часов назад', '{0} дней назад'],
            pt: ['{0} segundos atrás', '{0} minutos atrás', '{0} horas atrás', '{0} dias atrás'],
            bn: ['{0} সেকেন্ড আগে', '{0} মিনিট আগে', '{0} ঘন্টা আগে', '{0} দিন আগে'],
            id: ['{0} detik yang lalu', '{0} menit yang lalu', '{0} jam yang lalu', '{0} hari yang lalu'],
            ja: ['{0} 秒前', '{0} 分前', '{0} 時間前', '{0} 日前'],
            pa: ['{0} ਸਕਿੰਟ ਪਹਿਲਾਂ', '{0} ਮਿੰਟ ਪਹਿਲਾਂ', '{0} ਘੰਟੇ ਪਹਿਲਾਂ', '{0} ਦਿਨ ਪਹਿਲਾਂ'],
            jv: ['{0} detik yang lalu', '{0} menit yang lalu', '{0} jam yang lalu', '{0} hari yang lalu'],
            ko: ['{0}초 전', '{0}분 전', '{0}시간 전', '{0}일 전'],
            nl: ['{0} seconden geleden', '{0} minuten geleden', '{0} uren geleden', '{0} dagen geleden'],
            pl: ['{0} sekund temu', '{0} minut temu', '{0} godzin temu', '{0} dni temu'],
            sv: ['{0} sekunder sedan', '{0} minuter sedan', '{0} timmar sedan', '{0} dagar sedan'],
            no: ['{0} sekunder siden', '{0} minutter siden', '{0} timer siden', '{0} dager siden'],
            da: ['{0} sekunder siden', '{0} minutter siden', '{0} timer siden', '{0} dage siden'],
            fi: ['{0} sekuntia sitten', '{0} minuuttia sitten', '{0} tuntia sitten', '{0} päivää sitten'],
            tr: ['{0} saniye önce', '{0} dakika önce', '{0} saat önce', '{0} gün önce'],
            ro: ['acum {0} secunde', 'acum {0} minute', 'acum {0} ore', 'acum {0} zile'],
            hu: ['{0} másodperce', '{0} perce', '{0} órája', '{0} napja'],
            el: ['{0} δευτερόλεπτα πριν', '{0} λεπτά πριν', '{0} ώρες πριν', '{0} μέρες πριν'],
        };
        const languageStrings = languageMap[langCode] || languageMap["en"];
        if (diffInSeconds < 60) {
            return `${languageStrings[0].format(diffInSeconds)}`;
        }
        else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${languageStrings[1].format(minutes)}`;
        }
        else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${languageStrings[2].format(hours)}`;
        }
        else {
            const days = Math.floor(diffInSeconds / 86400);
            if (days <= maxDays) {
                return `${languageStrings[3].format(days)}`;
            }
            else {
                const dateString = date.toISOString();
                return `${dateString.slice(0, 10).split('-').reverse().join('-')} ${dateString.slice(11, 16)}`;
            }
        }
    }
    /**
     * Delays the execution asynchronously for a specified amount of time.
     *
     * @param {number} delayTimeMs - The delay time in milliseconds.
     * @returns {Promise<void>} - A promise that resolves after the delay.
     */
    static async delayAsync(delayTimeMs) {
        return new Promise(resolve => setTimeout(resolve, delayTimeMs));
    }
    /**
     * Returns all items in local storage.
     * @returns  An array of key-value pairs of all items in local storage
     */
    static getAllLocalStorageItems() {
        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key !== null) { // TypeScript null check
                const value = localStorage.getItem(key);
                if (value !== null) { // Ensure value is not null
                    items.push({ key, value });
                }
            }
        }
        return items;
    }
    /**
     * Recursively replaces properties in an object or elements in an array based on a provided callback function.
     * This function traverses an object or array and applies the callback to each element or property,
     * allowing for dynamic updates to the values based on their current values and paths. This version of the function
     * also provides the key of the current value being processed, which can be useful for more context-specific operations.
     * @param object The object or array to traverse and modify.
     * @param callback A function that takes the current path, the key of the current property or element, and its value,
     *                 then returns a new value. The function should accept three parameters: `currentPath` (a string representing
     *                 the path to the property or element), `key` (the current key or index as a string), and `currentValue`
     *                 (the current value of the property or element), and it should return the modified value.
     * @param path An optional initial path to prefix to each property or element path, used during recursive calls to maintain
     *             the full path.
     * @returns The modified object or array. This method returns the object with all its properties or elements processed,
     *          potentially modified by the callback.
     */
    static replacePropertyDeep(object, callback, path) {
        Object.keys(object).forEach(key => {
            const currentPath = path ? `${path}.${key}` : key;
            const currentValue = object[key];
            if (typeof currentValue == 'object' && currentValue != null) {
                CommonUtils.replacePropertyDeep(currentValue, callback, currentPath);
            }
            else {
                object[key] = callback(currentPath, key, object[key]);
            }
        });
        return object;
    }
    /**
     * Recursively searches for a value in an object based on a callback condition.
     *
     * @param {Object} object The object to search within.
     * @param {Function} callback A callback function that is called for each value in the object.
     *                            The function should return `true` if the current value matches the condition.
     *                            It receives parameters: currentPath (string), key (string), and currentValue (any).
     * @param {string} [path] The current path of the object being searched, used internally for recursion.
     * @returns {any} The value that matches the callback condition, or `undefined` if no matching value is found.
     */
    static findValueDeep(object, callback, path) {
        for (const key in object) {
            let returnValue;
            if (object.hasOwnProperty(key)) {
                const currentPath = path ? `${path}.${key}` : key;
                const currentValue = object[key];
                if (currentValue != null && typeof currentValue == 'object') {
                    returnValue = CommonUtils.findValueDeep(currentValue, callback, currentPath);
                }
                else if (callback(currentPath, key, object[key])) {
                    returnValue = currentValue;
                }
            }
            if (typeof returnValue != 'undefined') {
                return returnValue;
            }
        }
    }
}
exports.CommonUtils = CommonUtils;
/**
 * Retrieves the value from an object based on a key path.
 * For example, if the object is { parent: { child: { property: 'value' } } } and the key path is 'parent.child.property', the value 'value' will be returned.
 *
 * @param {any} object - The object to traverse.
 * @param {string} keypath - The key path (e.g., 'parent.child.property').
 * @returns {any} - The value at the specified key path or undefined if not found.
 */
CommonUtils.getObjectValueByPath = (object, keypath) => {
    return keypath.split('.').reduce((previous, current) => previous && previous[current], object) || undefined;
};
//# sourceMappingURL=common-utils.js.map