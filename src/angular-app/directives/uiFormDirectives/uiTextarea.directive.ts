import angular from 'angular';
import { ActionEvent, CONSTANTS } from '../../../common';
import { CommonUtils } from '../../../utils';

interface IUiTextAreaScope extends angular.IScope {
    id: string;
    ngModel: string;
    onChange: ActionEvent<string>;
}

export class UiTextarea implements angular.IDirective {
    restrict = 'E';
    template = `<textarea class="form-control {{class}}" 
                    style="padding-top:0px; {{style}}"
                    ng-model="ngModel" 
                    ng-keyup="onUserInteraction()"
                    ng-paste="onUserInteraction()"
                    ng-model-options="{ debounce: ${CONSTANTS.INPUT_DEBOUNCE_DELAY} }"                     
                    required="{{required}}" ng-readonly="disabled"></textarea>`;
    require = 'ngModel';
    scope = {
        ngModel: '=',
        required: '=',
        disabled: '=',
        onChange: '&',
        class: '@',
        style: '@'
    };
    link = ($scope: IUiTextAreaScope) => {
        $scope.id ||= CommonUtils.randomString();
        $scope.isUserInteraction = false;

        $scope.onUserInteraction = () => {
            $scope.isUserInteraction = true;
        };

        $scope.$watch('ngModel', (newValue: string) => {
            if (!$scope.isUserInteraction) {
                return;
            }
            $scope.isUserInteraction = false;
            if ($scope.onChange) {
                $scope.onChange({
                    args: {
                        args: [
                            newValue,
                            $scope.id
                        ]
                    }
                });
            }
        });
    }
}
