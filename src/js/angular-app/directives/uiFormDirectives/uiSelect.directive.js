"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiSelect = void 0;
const utils_1 = require("../../../utils");
class UiSelect {
    constructor() {
        this.restrict = 'E';
        this.template = `<select class="form-control" ng-model="ngModel" 
                    ng-options="option.value as option.label for option in options" 
                    required="{{required}}"
                    ng-disabled="disabled">
                </select>`;
        this.scope = {
            ngModel: '=',
            options: '=',
            required: '=',
            disabled: '='
        };
        this.link = ($scope, $element, $attrs) => {
            utils_1.AngularUtils.setElementId($scope, $attrs);
        };
    }
}
exports.UiSelect = UiSelect;
//# sourceMappingURL=uiSelect.directive.js.map