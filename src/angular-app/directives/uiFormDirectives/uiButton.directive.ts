import angular from 'angular';
import { ActionEvent, BsButtonStyle, BsSize, FaIcon } from '../../../common';
import { CommonUtils } from '../../../utils';

interface IActionButton {
    buttonStyle: BsButtonStyle;
    action: string;
    size: BsSize;
    icon: FaIcon;
    onClick: ActionEvent<string>;
}

export class UiButton implements angular.IDirective {
    restrict = 'E';
    template = `
    <button 
        type="button" 
        ng-disabled="disabled"
        ng-class="getButtonClass()" 
        ng-click="handleClick()">
        <i ng-if="icon" ng-class="getIconClass()"></i>
        <ng-transclude></ng-transclude>
    </button>
    `;
    transclude = true;
    scope = {
        id: '@',
        buttonStyle: '@?',
        onClick: '&',
        disabled: '=',
        size: '@?',
        icon: '@?',
        tooltip: '@?',
    };

    link = ($scope: angular.IScope & IActionButton) => {
        $scope.id ||= CommonUtils.randomString();

        $scope.getButtonClass = () => {
            return `${$scope.buttonStyle || BsButtonStyle.outlinePrimary} btn-${$scope.size || BsSize.md}`;
        };

        $scope.getIconClass = () => {
            return `${$scope.icon} fa-${$scope.size || BsSize.sm}`;
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



