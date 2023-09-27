import { Transform, plainToInstance } from 'class-transformer';
import { ClassType, Replacement } from './types';
import { IGroupedObject } from '../models';


// Array prototype extensions implementation ------------------------------------------------------------
Array.prototype.findDeep = function <T>(this: T[], keyToFind: keyof T, valToFind: any): T | undefined {
    let foundObj: T;
    JSON.stringify(this, (_, nestedValue) => {
        if (nestedValue && nestedValue[keyToFind] === valToFind) {
            foundObj = nestedValue;
        }
        return nestedValue;
    });
    return foundObj as T;
};

Array.prototype.includesIgnoreCase = function <T>(this: T[], value: T | keyof T, propName?: keyof T): boolean {
    if (typeof value === 'string') {
        return this.some(item => typeof item === 'string' && item.toLowerCase() === value.toLowerCase());
    } else if (typeof value === 'object') {
        if (propName) {
            return this.some(item => item[propName] && item[propName].toString().toLowerCase() === value[propName].toString().toLowerCase());
        }
        return this.includes(value);
    }
    return false;
};


Array.prototype.replace = function <T>(this: T[], target: T[] | T, predicate: (source: T, target: T) => boolean, replaceCallback?: (source: T, target: T) => T): T[] {
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
}


Array.prototype.removeByProps = function <T>(props: Partial<T>): T[] {
    const keys = Object.keys(props);
    this.forEach((item: { [x: string]: any; }, index: any) => {
        if (keys.every((key) => item[key] === props[key])) {
            this.splice(index, 1);
        }
    });
    return this;
};

Array.prototype.remove = function <T>(this: T[], predicate: (item: T, index: number) => boolean): T[] {
    let i = this.length;
    while (i--) {
        if (predicate(this[i], i)) {
            this.splice(i, 1);
        }
    }
    return this;
};

Array.prototype.excludeBy = function <T, T1>(this: T[], target: T1[] | T1, sourceKeyProperty: string | number, targetKeyProperty: string | number): T[] {
    if (!target) {
        return this;
    }
    const keys: string[] = [].concat(target).map(object => String(object[targetKeyProperty]));
    return this.filter(object => !keys.includes(String(object[sourceKeyProperty])));
}

Array.prototype.exclude = function <T, T1>(this: T[], target: T1[] | T1, predicate: (source: T, target: T1) => boolean): T[] {
    if (Array.isArray(target)) {
        return this && this.filter(source => !target.some(target => predicate(source, target)));
    }
    return this && this.filter(source => !predicate(source, target));
};

Array.prototype.sortBy = function <T>(this: T[], prop: string, isAsc = true): T[] {
    return this.sort((a, b) => {
        return (a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0) * (isAsc ? 1 : -1)
    });
}

Array.prototype.sortByKey = function <T>(this: T[], key: keyof T, order: 'asc' | 'desc' = 'asc', topKeys: any[] = [], bottomKeys: any[] = []): T[] {
    this.sort((a, b) => {
        if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
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

Array.prototype.first = function <T>(predicate: (value: T, index: number, array: T[]) => boolean, defaultValue?: T): T | undefined {
    for (let i = 0; i < this.length; i++) {
        if (predicate(this[i], i, this)) {
            return this[i];
        }
    }
    return defaultValue;
}

Array.prototype.last = function <T>(predicate: (value: T, index: number, array: T[]) => boolean, defaultValue?: T): T | undefined {
    for (let i = this.length - 1; i >= 0; i--) {
        if (predicate(this[i], i, this)) {
            return this[i];
        }
    }
    return defaultValue;
}

Array.prototype.toMap = function <T, K, O>(keyCb: (item: T) => K, valueCb: (item: T) => O): Map<K, O> {
    return this.reduce((map: { set: (arg0: K, arg1: O) => void; }, item: T) => {
        map.set(keyCb(item), valueCb(item));
        return map;
    }, new Map<K, O>());
};

Array.prototype.innerJoin = function <T, TTarget, TResult>(this: T[], target: TTarget[], comparator: (source: T, target: TTarget) => boolean, selector: (source: T, target: TTarget) => TResult): TResult[] {
    return this.reduce<TResult[]>((prev, source) => {
        target.forEach(tgt => {
            if (comparator(source, tgt)) prev.push(selector(source, tgt));
        });
        return prev;
    }, []);
}

Array.prototype.leftJoin = function <T, TTarget, TResult>(this: T[], target: TTarget[], comparator: (source: T, target: TTarget) => boolean, selector: (source: T, target: TTarget) => TResult): TResult[] {
    return this.reduce<TResult[]>((prev, source) => {
        let found = false;
        target.forEach(tgt => {
            if (comparator(source, tgt)) {
                prev.push(selector(source, tgt));
                found = true;
            }
        });
        if (!found) prev.push(selector(source, null));
        return prev;
    }, []);
}

Array.prototype.rightJoin = function <T, TTarget, TResult>(this: T[], target: TTarget[], comparator: (source: T, target: TTarget) => boolean, selector: (source: T, target: TTarget) => TResult): TResult[] {
    return target.reduce<TResult[]>((prev, tgt) => {
        let found = false;
        this.forEach(source => {
            if (comparator(source, tgt)) {
                prev.push(selector(source, tgt));
                found = true;
            }
        });
        if (!found) prev.push(selector(null, tgt));
        return prev;
    }, []);
}

Array.prototype.crossJoin = function <T, TTarget, TResult>(this: T[], target: TTarget[], selector: (source: T, target: TTarget) => TResult): TResult[] {
    return this.reduce<TResult[]>((prev, source) => {
        target.forEach(tgt => {
            prev.push(selector(source, tgt));
        });
        return prev;
    }, []);
}

Array.prototype.fullJoin = function <T, TTarget, TResult>(this: T[], target: TTarget[], comparator: (source: T, target: TTarget) => boolean, selector: (source: T, target: TTarget) => TResult): TResult[] {
    const result: TResult[] = [];
    const sourceMatched: boolean[] = new Array(this.length).fill(false);
    const targetMatched: boolean[] = new Array(target.length).fill(false);

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
}

Array.prototype.sum = function <T>(this: T[], callback: (item: T) => number): number {
    return this.reduce((acc: number, curr: T) => acc + callback(curr), 0);
};

Array.prototype.distinct = function <T>(this: T[], prop?: string): T[] {
    return this && [...new Map(this.map(item => {
        if (prop && (typeof item == 'object'))
            return [item[prop], item];
        return [item, item];
    })).values()];
}

Array.prototype.offset = function <T>(this: T[], number: number): T[] {
    return this && this.slice(number);
}

Array.prototype.take = function <T>(this: T[], number: number): T[] {
    return this && this.slice(0, number);
}

Array.prototype.move = function <T>(this: T[], from: number, to: number): T[] {
    this.splice(to, 0, this.splice(from, 1)[0]);
    return this;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Array.prototype.flatBy = function <TChild, TParent>(this: TParent[], flatByProp: keyof TParent, _classType: ClassType<TChild>): TChild[] {
    return this.reduce((result: TChild[], parent: TParent) => {
        const children = parent[flatByProp];
        if (Array.isArray(children)) {
            return [...result, ...(children as TChild[])];
        }
        return result;
    }, [] as TChild[]);
};

// String prototype extensions implementation ------------------------------------------------------------
String.prototype.format = function (this: string, ...args: any[]) {
    return this.replace(/{(\d+)}/g, function (match: string, number: number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match;
    });
};

String.prototype.normalizeFilename = function (this: string): string {
    let ext = '';
    const extIndex = this.lastIndexOf('.');
    if (extIndex !== -1) {
        ext = this.substring(extIndex);
    }

    let filename = ext ? this.substring(0, extIndex) : this;

    filename = filename.replace(/[^a-zA-Z0-9_.-]/g, '-');

    return filename + ext;
};

String.prototype.replaceStrings = function (this: string, ...replacements: Replacement[]): string {
    let result = this;
    for (const replacement of replacements) {
        const from = RegExp(replacement.toRegex ? replacement.toRegex : RegExp.escape(replacement.from), replacement.firstOnly ? '' : 'g');
        result = result.replace(from, replacement.to);
    }
    return result;
};


Array.prototype.groupByProp = function <T, GroupKey extends keyof T>(
    this: T[],
    groupByProperty: GroupKey,
    groupKeyProperty: string,
    groupArrayProperty: string
): Array<IGroupedObject<T, GroupKey>> {
    const groupMap = new Map<T[GroupKey], Array<{ [prop: string]: any }>>();

    for (const obj of this) {
        const key = obj[groupByProperty];

        if (!groupMap.has(key)) {
            groupMap.set(key, []);
        }

        const group = groupMap.get(key);

        group?.push({ ...obj });
    }

    const groupedArray = Array.from(groupMap.entries()).map(([key, values]) => ({
        [groupKeyProperty]: key,
        [groupArrayProperty]: values,
    }));

    return groupedArray.sort((a, b) => (a[groupKeyProperty] > b[groupKeyProperty]) ? 1 : -1);
};


// RegExp extensions implementation ------------------------------------------------------------
RegExp.escape = function (rawExpression: string): string {
    return rawExpression.replace(/[\^$.*+?()[{\\]/g, '\\$&');
};


// Decorators implementation ------------------------------------------------------------
/**
 *  Decorator for class properties to initialize property value with default value if it's null or undefined. 
 * @param defaultValue - The default value to initialize with.
 * */
export function Default(defaultValue: any): PropertyDecorator {
    return Transform(({ value }) => {
        if (value !== null && value !== undefined) return value;
        if (typeof defaultValue === 'function') return defaultValue();
        if (Array.isArray(defaultValue)) return [...defaultValue];
        if (typeof defaultValue === 'object') {
            return (defaultValue === null) ? null : { ...defaultValue };
        }
        return defaultValue;
    });
}

/**
 *  Decorator for class properties to exclude property from serialization if it's value equals to default value. 
 * @param defaultValue - The default value to compare to.
 * */
export function ExcludeIfDefault(defaultValue: any): PropertyDecorator {
    return Transform(({ value }) => {
        if (typeof defaultValue != 'undefined'
            && (typeof value != 'object' && value == defaultValue
                || typeof value == 'object' && JSON.stringify(value) == JSON.stringify(defaultValue))) {
            return undefined;
        }
        return value;
    });
}

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
export function initOnce() {
    return function (target: any, propertyKey: string) {
        let _value: any;

        Object.defineProperty(target, propertyKey, {
            get: function () {
                if (typeof _value === 'function') {
                    _value = _value.call(this);
                }
                return _value;
            },

            set: function (newVal: any) {
                _value = newVal;
            },

            configurable: true,

            enumerable: true
        });
    };
}

/**
 *  Method to convert plain map to class map.
 *  Used with class-transformer \@Transform decorator.
 * @param value 
 * @param classType 
 * @returns 
 */
export function mapTransform<T>(classType: ClassType<T>, value: any) {
    const objectsMap = new Map<string, any>();
    if (value && value.obj && value.obj.objectsMap instanceof Map) {
        for (const entry of value.obj.objectsMap.entries()) {
            objectsMap.set(entry[0], plainToInstance(classType, entry[1]));
        }
    }
    return objectsMap;
}



