"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiInput = void 0;
const utils_1 = require("../../../utils");
const common_1 = require("../../../common");
class UiInput {
    constructor() {
        this.restrict = 'E';
        this.template = `<input class="form-control" 
                    type="{{type || 'text'}}"
                    style="padding-top:0px"
                    ng-model="ngModel" 
                    required="{{required}}" 
                    ng-model-options="{ debounce: ${common_1.CONSTANTS.INPUT_DEBOUNCE_DELAY} }" 
                    ng-disabled="disabled">`;
        this.require = 'ngModel';
        this.scope = {
            type: '@',
            ngModel: '=',
            required: '=',
            disabled: '='
        };
        this.link = ($scope, $element, $attrs) => {
            utils_1.AngularUtils.setElementId($scope, $attrs);
        };
    }
}
exports.UiInput = UiInput;
//# sourceMappingURL=uiInput.directive.js.map