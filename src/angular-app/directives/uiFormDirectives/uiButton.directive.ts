import angular from 'angular';
import { ActionEvent, BsButtonStyle, BsSize } from '../../../common';
import { AngularUtils } from '../../../utils';

interface IActionButton {
    buttonStyle: BsButtonStyle;
    tooltip: string;
    action: string;
    size: BsSize;
    onClick: ActionEvent<string>;
}

export class UiButton implements angular.IDirective {
    restrict = 'E';
    template = `
    <button 
        type="button" 
        class="btn" 
        ng-disabled="disabled"
        ng-class="getButtonClass()" 
        ng-click="handleClick()">
        <ng-transclude></ng-transclude>
    </button>
    `;
    transclude = true;
    scope = {
        buttonStyle: '@?',
        onClick: '&',
        disabled: '=',
        size: '@',
    };

    link = ($scope: angular.IScope & IActionButton, $element: angular.IAugmentedJQuery, $attrs: angular.IAttributes) => {
        AngularUtils.setElementId($scope, $attrs);

        $scope.getButtonClass = () => {
            return `${$scope.buttonStyle || BsButtonStyle.outlinePrimary} btn-${$scope.size || BsSize.md}`;
        };

        $scope.handleClick = () => {
            if ($scope.onClick) {
                $scope.onClick({
                    args: {
                        args: [$scope.action]
                    }
                });
            }
        };
        
    };
}



