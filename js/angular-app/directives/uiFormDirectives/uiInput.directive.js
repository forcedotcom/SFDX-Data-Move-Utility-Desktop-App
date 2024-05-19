"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiInput = void 0;
const common_1 = require("../../../common");
const utils_1 = require("../../../utils");
class UiInput {
    constructor() {
        this.restrict = 'E';
        this.template = `<input class="form-control" 
                    type="{{type || 'text'}}"
                    style="padding-top:0px"
                    ng-model="ngModel" 
                    required="{{required}}" 
                    ng-model-options="{ debounce: ${common_1.CONSTANTS.INPUT_DEBOUNCE_DELAY} }" 
                    ng-readonly="disabled">`;
        this.require = 'ngModel';
        this.scope = {
            id: '@',
            type: '@',
            ngModel: '=',
            required: '=',
            disabled: '='
        };
        this.link = ($scope) => {
            $scope.id || ($scope.id = utils_1.CommonUtils.randomString());
        };
    }
}
exports.UiInput = UiInput;
//# sourceMappingURL=uiInput.directive.js.map