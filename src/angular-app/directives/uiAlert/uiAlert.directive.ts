import { IAugmentedJQuery } from "angular";
import { IActionEventArgParam, IAlert } from "../../../models";
import { AngularUtils } from "../../../utils";
import { IBroadcastService } from "../../services";

interface IAlertScope extends IAlert, angular.IScope {
	id: string;
	dismissable: boolean;
	shownAlways: boolean;
	neutralBg: boolean;
	shown: boolean;
	showBreak: boolean;

	iconClass(): string;
	dismiss(): void;
	shouldBeShown(): boolean;
}

class UIAlertDirective implements angular.IDirective {

	restrict = 'E';
	template = `
        <div ng-if="shouldBeShown()" class="alert alert-{{ neutralBg ? '' : type }}  d-flex justify-content-between" role="alert">
			<div class="d-flex {{ messageClass }}">
				<div ng-if="!hideIcon" tooltip="{{ iconTooltip }}" tooltip-custom-class="{{ iconTooltipCustomClass }}">
					<i class="me-2 fa-2x" ng-class="iconClass()"></i>
				</div>
				<div ng-bind-html="message" class="{{ neutralBg ? 'text-' + type : ''  }}"></div>
				<div ng-if="showBreak" class="flex-break"></div>
				<div ng-transclude></div>
			</div>
            <button ng-if="dismissable" 
				type="button" 
				class="btn-close position-relative d-block ms-1" 
				ng-click="dismiss()"
				tooltip="{{ 'HIDE_AND_NOT_SHOW_AGAIN' | translate }}">
			</button>
        </div>
    `;

	scope = {
		id: '@',
		message: '@',
		messageClass: '@',
		type: '@',
		dismissable: '=',
		shown: '=?',
		shownAlways: '=?',
		iconTooltip: '@',
		iconTooltipCustomClass: '@',
		neutralBg: '=',
		showBreak: '=',
		hideIcon: '='
	};

	transclude = true;

	constructor(private $broadcast: IBroadcastService) { }

	link($scope: IAlertScope, $element: IAugmentedJQuery, $attrs: angular.IAttributes) {

		$scope.id = AngularUtils.setElementId($scope, $attrs);

		$scope.dismiss = () => {
			localStorage.setItem($scope.id, 'dismissed');
		};

		$scope.shouldBeShown = () => {
			if ($scope.shownAlways) return true;
			if (!$scope.shown) return false;

			return localStorage.getItem($scope.id) !== 'dismissed';
		};

		$scope.iconClass = () => {

			const iconClass = $scope.neutralBg ? ` text-${$scope.type}` : '';

			switch ($scope.type) {

				case 'warning':
					return 'fa fa-exclamation-triangle' + iconClass;

				case 'primary':
					return 'fa fa-flag' + iconClass;

				case 'success':
					return 'fa fa-thumbs-up' + iconClass;

				case 'danger':
					return 'fa fa-times-circle' + iconClass;

				default:
					return 'fa fa-info-circle' + iconClass;
			}
		};

		$scope.refresh = () => {

			$scope.shown = $scope.shown !== false;
			$scope.shownAlways = $scope.shownAlways === true;

			if (!$scope.type) {
				$scope.type = 'info';
			}
		}

		$scope.$watchGroup(['type', 'show'], () => {
			$scope.refresh();
		});

		this.$broadcast.onAction('setAlert', 'uiAlert', (args: IActionEventArgParam<IAlert>) => {
			if (args.componentId === $scope.id) {
				AngularUtils.$apply($scope, () => {
					Object.assign($scope, (args?.args[0] || {}) as IAlert);
					$scope.refresh();
				});
			}
		});
	}

}

export const uiAlertDirectiveModule = angular.module('uiAlertDirectiveModule', [])
	.directive('uiAlert', ['$broadcast', function ($broadcast) { return new UIAlertDirective($broadcast) }]);
