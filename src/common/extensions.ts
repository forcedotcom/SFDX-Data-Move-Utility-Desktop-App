/* eslint-disable no-var */

import { ClassType, Replacement } from ".";
import { AppGlobalData, IGroupedObject, JSONEditor } from "../models";


/**
 * Global declarations for the application.
 */
declare global {

  // Global variables declaration -----------------------------------------------------------------
  var appGlobal: AppGlobalData;



  // Window extensions declaration ------------------------------------------------------------------
  interface Window {
    /** Jquery object. */
    $: JQuery;
    /** Jquery object. */
    jQuery: JQuery;
    /** bootstrap object. */
    bootstrap: any;
    /** JSON Editor class */
    JSONEditor: typeof JSONEditor;
  }


  // JQuery extensions declaration ------------------------------------------------------------------
  interface JQuery {
    /**
     * Transfers settings to the current jQuery object.
     *
     * @param {...any} settings - The settings to transfer.
     * @returns {JQuery} - The current jQuery object.
     */
    transfer: (...settings: any) => JQuery;
  }



  // Array prototype extensions declaration ------------------------------------------------------------
  interface Array<T> {
    /**
     * Finds the first element in the array that matches the specified key-value pair.
     *
     * @param {keyof T} keyToFind - The property to search for.
     * @param {any} valToFind - The value to match.
     * @returns {T | undefined} - The found element or undefined if not found.
     */
    findDeep(keyToFind: keyof T, valToFind: any): T | undefined;

    /**
     * Checks if the array includes a value (case-insensitive) or property value (case-insensitive) of an object.
     *
     * @param {T | keyof T} value - The value or property name to check for inclusion.
     * @param {keyof T} [propName] - (Optional) The property name to compare the value against.
     * @returns {boolean} - A boolean indicating whether the array includes the specified value or property value.
     */
    includesIgnoreCase(this: T[], value: T | keyof T, propName?: keyof T): boolean;

    /**
     * Replaces an element in the array with another element.
     * @param {T[] | T} target - The target element or array of elements to replace.
     * @param {(source: T, target: T) => boolean} predicate - The predicate function to use for comparison.
     * @param {(source: T, target: T) => T} [replaceCallback] - (Optional) The callback function to use for replacement.
     * @returns {T[]} - The array with the replaced elements.
     */
    replace: <T>(this: T[], target: T[] | T, predicate: (source: T, target: T) => boolean, replaceCallback?: (source: T, target: T) => T) => T[];


    /**
     * Removes elements from the array that match the specified partial object properties.
     *
     * @param {T[]} props - The partial object with properties to match for removal.
     * @returns {T[]} - The array with matching elements removed.
     */
    removeByProps<T>(this: T[], props: Partial<T>): T[];

    /**
     * Removes elements from the array by the specified predicate function.
     *
     * @param {Function} predicate - The callback function to determine if an item should be removed.
     * @returns {Array} The updated array with removed items.
     */
    remove: (this: T[], predicate: (item: T, index: number) => boolean) => T[];

    /**
     * Adds a `exclude` method to the Array interface.
     *
     * @param {Array} target - The target array or item(s) to exclude from the source array.
     * @param {Function} predicate - The predicate function to determine if an item should be excluded.
     * @returns {Array} The updated array with excluded items.
     */
    exclude: <T, T1>(this: T[], target: T1[] | T1, predicate: (source: T, target: T1) => boolean) => T[];


    /**
    * Adds an `excludeBy` method to the Array interface.
    *
    * @param {Array} target - The target array or item(s) to exclude from the source array.
    * @param {string | number} sourceKeyProperty - The property name or index used for comparison in the source array.
    * @param {string | number} targetKeyProperty - The property name or index used for comparison in the target array.
    * @returns {Array} The updated array with excluded items.
    */
    excludeBy<T, T1>(this: T[], target: T1[] | T1, sourceKeyProperty: string | number, targetKeyProperty: string | number): T[];


    /** 
     * Sorts the array based on the provided property in ascending or descending order.
     * @param {string} prop The property to sort by.
     * @param {boolean} [isAsc=true] Determines if the sort is in ascending order.
     * @returns {T[]} The sorted array.
     */
    sortBy: <T>(this: T[], prop: string, isAsc?: boolean) => T[];

    /**
     * Sorts the array by the given key in the specified order, with the option to place certain keys at the top or bottom.
     * @param {keyof T} key The key to sort by.
     * @param {'asc' | 'desc'} [order] The order to sort in. Default is ascending.
     * @param {any[]} [topKeys] Keys that should appear at the start of the sorted array.
     * @param {any[]} [bottomKeys] Keys that should appear at the end of the sorted array.
     * @returns {T[]} The sorted array.
     */
    sortByKey(this: T[], key: keyof T, order?: 'asc' | 'desc', topKeys?: any[], bottomKeys?: any[]): T[];



    /**
     * Returns the first element in the array that satisfies the provided predicate.
     * @param predicate - Function to test each element of the array.
     * @param defaultValue - The default value to return if no element satisfies the predicate.
     * @returns The first element that satisfies the predicate, or undefined if no element satisfies the predicate.
     */
    first(this: T[], predicate: (value: T, index: number, array: T[]) => boolean, defaultValue?: T): T | undefined;

    /**
     * Returns the last element in the array that satisfies the provided predicate.
     * @param predicate - Function to test each element of the array.
     * @param defaultValue - The default value to return if no element satisfies the predicate.
     * @returns The last element that satisfies the predicate, or undefined if no element satisfies the predicate.
     */
    last(this: T[], predicate: (value: T, index: number, array: T[]) => boolean, defaultValue?: T): T | undefined;

    /**
    * Converts the array into a Map using the provided key and value callback functions.
    *
    * @param {(item: T) => K} keyCb - The callback function to extract the key from each array element.
    * @param {(item: T) => O} valueCb - The callback function to extract the value from each array element.
    * @returns {Map<K, O>} - A Map with keys and values extracted from the array elements.
    */
    toMap<K, O>(keyCb: (item: T) => K, valueCb: (item: T) => O): Map<K, O>;


    /**
     * Groups the array elements based on the specified property.
     *
     * @param {GroupKey} groupByProperty - The property to group the array elements by.
     * @param {string} groupKeyProperty - The property name to store the group key.
     * @param {string} groupArrayProperty - The property name to store the group array.
     * @returns {Array<sharedApp.IGroupedObject<T, GroupKey>>} - An array of grouped objects.
     */
    groupByProp<GroupKey extends keyof T>(
      groupByProperty: GroupKey,
      groupKeyProperty: string,
      groupArrayProperty: string
    ): Array<IGroupedObject<T, GroupKey>>;



    /**
     * Performs an inner join operation with the target array based on the specified comparator and selector functions.
     *
     * @param {TTarget[]} target - The target array to join with.
     * @param {(source: T, target: TTarget) => boolean} comparator - The comparator function to determine the join condition.
     * @param {(source: T, target: TTarget) => TResult} selector - The selector function to create the result elements.
     * @returns {TResult[]} - The result array obtained from the inner join operation.
     */
    innerJoin<TTarget, TResult>(target: TTarget[], comparator: (source: T, target: TTarget) => boolean, selector: (source: T, target: TTarget) => TResult): TResult[];

    /**
     * Performs a left join operation with the target array based on the specified comparator and selector functions.
     *
     * @param {TTarget[]} target - The target array to join with.
     * @param {(source: T, target: TTarget) => boolean} comparator - The comparator function to determine the join condition.
     * @param {(source: T, target: TTarget) => TResult} selector - The selector function to create the result elements.
     * @returns {TResult[]} - The result array obtained from the left join operation.
     */
    leftJoin<TTarget, TResult>(target: TTarget[], comparator: (source: T, target: TTarget) => boolean, selector: (source: T, target: TTarget) => TResult): TResult[];

    /**
     * Performs a right join operation with the target array based on the specified comparator and selector functions.
     *
     * @param {TTarget[]} target - The target array to join with.
     * @param {(source: T, target: TTarget) => boolean} comparator - The comparator function to determine the join condition.
     * @param {(source: T, target: TTarget) => TResult} selector - The selector function to create the result elements.
     * @returns {TResult[]} - The result array obtained from the right join operation.
     */
    rightJoin<TTarget, TResult>(target: TTarget[], comparator: (source: T, target: TTarget) => boolean, selector: (source: T, target: TTarget) => TResult): TResult[];

    /**
     * Performs a cross join operation with the target array based on the specified selector function.
     *
     * @param {TTarget[]} target - The target array to join with.
     * @param {(source: T, target: TTarget) => TResult} selector - The selector function to create the result elements.
     * @returns {TResult[]} - The result array obtained from the cross join operation.
     */
    crossJoin<TTarget, TResult>(target: TTarget[], selector: (source: T, target: TTarget) => TResult): TResult[];

    /**
     * Performs a full join operation with the target array based on the specified comparator and selector functions.
     *
     * @param {TTarget[]} target - The target array to join with.
     * @param {(source: T, target: TTarget) => boolean} comparator - The comparator function to determine the join condition.
     * @param {(source: T, target: TTarget) => TResult} selector - The selector function to create the result elements.
     * @returns {TResult[]} - The result array obtained from the full join operation.
     */
    fullJoin<TTarget, TResult>(target: TTarget[], comparator: (source: T, target: TTarget) => boolean, selector: (source: T, target: TTarget) => TResult): TResult[];

    /**
     *  Sums values returned from the specified callback function.
     * @param callback  - The callback function to return the value to sum.
     */
    sum(callback: (item: T) => number): number;


    /**
    * Returns an array with distinct elements based on the specified property.
    *
    * @param {string} prop - (Optional) The property to compare for distinctness.
    * @returns {T[]} - An array with distinct elements.
    */
    distinct: <T>(this: T[], prop?: string) => T[];

    /**
     * Returns a new array starting from the specified index.
     *
     * @param {number} number - The index to start the new array from.
     * @returns {T[]} - A new array starting from the specified index.
     */
    offset: <T>(this: T[], number: number) => T[];

    /**
     * Returns a new array with the specified number of elements.
     *
     * @param {number} number - The number of elements to include in the new array.
     * @returns {T[]} - A new array with the specified number of elements.
     */
    take: <T>(this: T[], number: number) => T[];

    /**
     * Moves an element from the specified 'from' index to the 'to' index.
     *
     * @param {number} from - The index from which to move the element.
     * @param {number} to - The index to which the element should be moved.
     * @returns {T[]} - An array with the element moved to the specified index.
     */
    move: <T>(this: T[], from: number, to: number) => T[];


    /**
     * Flattens the array of parent objects by extracting a property and returning an array of child objects.
     *
     * @param {keyof TParent} flatByProp - The property to flatten the parent objects by.
     * @param {ClassType<TChild>} classType - The class type of the child objects.
     * @returns {TChild[]} - An array of flattened child objects.
     */
    flatBy<TParent, TChild>(this: TParent[], flatByProp: keyof TParent, classType: ClassType<TChild>): TChild[];


  }

  interface String {
    /**
     * Formats a string using the specified arguments.
     * @param args The arguments to use for formatting.
     * @returns The formatted string.
     */
    format: (this: string, ...args: any[]) => string;

    /**
   * Adds a `normalizeFilename` method to the String interface.
   *
   * @returns {string} The normalized filename string.
   */
    normalizeFilename(): string;


    /**
     * Adds a `replaceStrings` method to the String interface.
     *
     * @param {...Replacement} replacements - The replacements to perform on the string.
     * @returns {string} The string with the specified replacements made.
     */
    replaceStrings(...replacements: Replacement[]): string;

    /**
        * Removes the specified character from the end of the string.
        * If no character is provided, whitespace will be trimmed by default.
        * 
        * @param charToTrim - The character to remove from the end of the string. If not specified, whitespace will be trimmed.
        * @returns A new string with the specified character removed from the end.
        */
    trimEnd(charToTrim?: string): string;

    /**
     * Removes the specified character from the start of the string.
     * If no character is provided, whitespace will be trimmed by default.
     * 
     * @param charToTrim - The character to remove from the start of the string. If not specified, whitespace will be trimmed.
     * @returns A new string with the specified character removed from the start.
     */
    trimStart(charToTrim?: string): string;

  }

  // RegExp prototype extensions declaration ------------------------------------------------------------
  interface RegExpConstructor {
    /**
     * Escapes a raw regular expression string.
     * @param {string} rawExpression - The raw regular expression to escape.
     */
    escape(rawExpression: string): string;
  }

  // Angular IScope extensions declaration ------------------------------------------------------------
  module angular {
    interface IScope {
      /** 
       * Dynamic properties added to the scope.
       */
      [prop: string]: any;
    }
  }

}





export { };
