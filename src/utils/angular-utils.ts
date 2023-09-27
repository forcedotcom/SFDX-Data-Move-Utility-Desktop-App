import { IAttributes, IScope } from "angular";
import { CommonUtils } from ".";

export class AngularUtils {

    /**
     * Sets the id attribute of the element if it is not set.
     * @param $attrs The attributes of the element.
     * @param $scope The scope of the element.
     * @returns The id of the element.
     */
    static setElementId($scope: IScope, $attrs: IAttributes): string {
        // if id is not set, generate a random string
        const id = AngularUtils.$eval($scope, $attrs.id) || CommonUtils.randomString();
        $attrs.$set('id', id);
        return id;
    }

    /** 
     * Evalues an expression in the scope and returns the value. 
     *  If the expression evaluates to undefined, the expression is returned.
     * @param $scope The scope of the element.
     * @param expression The expression to evaluate.
     * @returns The value of the expression.
    */
    static $eval($scope: IScope, expression: string): any {
        let value = $scope.$eval(expression);
        if (expression && value == undefined) {
            if (expression.includes('{{')) {
                return value;
            }
            value = expression;
        }
        return value;
    }

    /**
    * Safely applies the AngularJS digest cycle on the provided $scope.
    * @param {angular.IScope} $scope - The AngularJS $scope object.
    * @param {($scope?: angular.IScope) => any} [callback] - The optional callback function to execute.
    * @param {boolean} [applyAlways=true] - Indicates whether to always apply the digest cycle.
    */
    static $apply($scope: angular.IScope, callback?: ($scope?: angular.IScope) => any, applyAlways = true) {
        const $root = $scope.$root || $scope;
        if ($root.$$phase != '$apply' && $root.$$phase != '$digest') {
            if (callback) {
                $scope.$apply(callback);
            } else {
                $scope.$digest();
            }
        } else if (applyAlways && callback) {
            callback($scope);
        }
    }

    /**
     * Gets the controller of the element.
     * @param elemSelector The selector of the element.
     * @returns The controller of the element.
     */
    static $getController<T>(elemSelector: string): T | undefined {
        if (!elemSelector) return null;
        const $element = angular.element(elemSelector);
        if (!$element.length) {
            return null;
        }
        const $ctrl = Object.entries($element.data()).first(([key]) => key.startsWith('$') && key.endsWith('Controller'), [null, null])[1];
        return $ctrl as T;
    }


    /**
     * Calculates the absolute height (in pixels) between the bottom edge of a top element 
     * and the top edge of a bottom element.
     * @param topElemSelector - The selector for the top element.
     * @param bottomElemSelector - The selector for the bottom element.
     * @param defaultHeight - The default height to return if the elements are not found.
     * @returns The height in pixels.
     */
    public static calculateHeightBetween(topElemSelector: string, bottomElemSelector: string, defaultHeight?: number): number {
        const topElem = document.querySelector(topElemSelector);
        const bottomElem = document.querySelector(bottomElemSelector);

        if (!topElem || !bottomElem) {
            return defaultHeight || 0;
        }

        const topElemRect = topElem.getBoundingClientRect();
        const bottomElemRect = bottomElem.getBoundingClientRect();

        // Calculate the absolute position for each element with respect to the document.
        const topElemAbsoluteBottom = topElemRect.bottom + window.scrollY;
        const bottomElemAbsoluteTop = bottomElemRect.top + window.scrollY;

        const distance = bottomElemAbsoluteTop - topElemAbsoluteBottom;

        return distance;
    }

    /**
     * Sets the max-height and overflow-y properties of an element to make it scrollable.
     * @param elemSelector - The selector for the element.
     * @param maxHeight - The max-height to set.
     * @param positionRelated - Indicates whether the position should be set to relative.
     * @param overflowXHidden - Indicates whether the overflow-x should be set to hidden.
     */
    static setScrollable(elemSelector: string, maxHeight: string, positionRelated = true, overflowXHidden = true) {
        const element = angular.element(document.querySelector(elemSelector));

        if (element && element.length > 0) {
            element.css({
                'max-height': maxHeight,
                'overflow-y': 'auto',
                'position': positionRelated ? 'relative' : 'static'
            });

            if (overflowXHidden) {
                element.css('overflow-x', 'hidden');
            }
        }
    }

     /**
     *  Copies the text content of the specified element to the clipboard.
     * @param elementSelector  - The selector of the element to copy.
     * @param copyValue  - Indicates whether to copy the value of the element instead of the text content.
     * @returns  - A promise that resolves to true if the operation was successful, otherwise false.
     */
     static async copyElementToClipboardAsync(elementSelector: string, copyValue = false): Promise<boolean> {
        const element = angular.element(document.querySelector(elementSelector));
        if (element && navigator.clipboard) {
            try {
                let value = '';
                if (copyValue) {
                    value = element.val() as string;
                } else {
                    value = element.text();
                }
                await navigator.clipboard.writeText(value);
                return true;
            } catch (error) {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * Copies the specified text to the clipboard.
     * @param text - The text to copy.
     * @returns A promise that resolves to true if the operation was successful, otherwise false.
     */ 
    static async copyTextToClipboardAsync(text: string): Promise<boolean> {
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                return false;
            }
        } else {
            return false;
        }
    }

    
}