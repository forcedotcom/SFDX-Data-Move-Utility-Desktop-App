"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiTextarea = void 0;
const utils_1 = require("../../../utils");
const common_1 = require("../../../common");
class UiTextarea {
    constructor() {
        this.restrict = 'E';
        this.template = `<textarea class="form-control" 
                    style="padding-top:0px"
                    ng-model="ngModel" 
                    ng-model-options="{ debounce: ${common_1.CONSTANTS.INPUT_DEBOUNCE_DELAY} }" 
                    required="{{required}}" ng-disabled="disabled"></textarea>`;
        this.require = 'ngModel';
        this.scope = {
            ngModel: '=',
            required: '=',
            disabled: '='
        };
        this.link = ($scope, $element, $attrs) => {
            utils_1.AngularUtils.setElementId($scope, $attrs);
        };
    }
}
exports.UiTextarea = UiTextarea;
//# sourceMappingURL=uiTextarea.directive.js.map