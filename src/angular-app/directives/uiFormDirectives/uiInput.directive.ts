import angular from 'angular';
import { CONSTANTS } from '../../../common';
import { CommonUtils } from '../../../utils';


export class UiInput implements angular.IDirective {
    restrict = 'E';
    template = `<input class="form-control" 
                    type="{{type || 'text'}}"
                    style="padding-top:0px"
                    ng-model="ngModel" 
                    required="{{required}}" 
                    ng-model-options="{ debounce: ${CONSTANTS.INPUT_DEBOUNCE_DELAY} }" 
                    ng-readonly="disabled">`;
    require = 'ngModel';
    scope = {
        id: '@',
        type: '@',
        ngModel: '=',
        required: '=',
        disabled: '='
    };
    link = ($scope: angular.IScope) => {
        $scope.id ||= CommonUtils.randomString();
    }
}
