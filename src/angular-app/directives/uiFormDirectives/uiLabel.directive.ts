import angular from 'angular';
import bootstrap from 'bootstrap';
import { SfdmuService } from '../../../services';

export class UiLabel implements angular.IDirective {
	restrict = 'E';
	template = `
		<label class="form-label fw-bold">
			<span ng-if="$ctrl.label" ng-bind-html="$ctrl.label"></span>
			<i ng-if="$ctrl.iconTooltip" class="{{ $ctrl.icon }}" data-bs-toggle="tooltip" title="{{ $ctrl.iconTooltip }}"></i>
			<a ng-if="$ctrl.addHelpLinks" 
					data-bs-toggle="tooltip"	title="{{ 'CLICK_TO_NAVIGATE_TO_HELP_ARTICLE' | translate }}"
				 href="javascript:void(0)"
				ng-click="$ctrl.navigateToHelpArticle($ctrl.helpSearchWord || $ctrl.label)"
				class="text-primary-dashed">
					<i class="fa fa-link fa-sm"></i>
			</a>
		</label>
    `;
	controller = UiLabelController;
	controllerAs = '$ctrl';
	bindToController = true;
	scope = {
		label: '@',
		icon: '@',
		iconTooltip: '@',
		helpSearchWord: '@',
		addHelpLinks: '<'
	};

	link = ($scope: angular.IScope, $element: angular.IAugmentedJQuery, $attrs: angular.IAttributes, $ctrl: UiLabelController) => {
		$scope.$on('$destroy', () => {
			$ctrl.destroyTooltips($element);
		});
		$scope.$watch('$ctrl.iconTooltip', () => {
			$ctrl.setTooltips($element);
		});
	}
}

class UiLabelController {

	static $inject = ['$timeout'];

	public label: string;
	public icon: string;
	public iconTooltip: string;
	public helpSearchWord: string;
	public addHelpLinks: boolean;

	constructor(private $timeout: angular.ITimeoutService) { }

	navigateToHelpArticle(searchTerm: string) {
		SfdmuService.navigateToHelpArticle(searchTerm);
	}

	setTooltips($element: angular.IAugmentedJQuery) {
		this.$timeout(() => {
			this.destroyTooltips($element);
			const tooltipElements = $element.find('[data-bs-toggle="tooltip"]');
			tooltipElements.each((index, el: HTMLElement) => {
				new bootstrap.Tooltip(el);
			});
		}, 50);
	}

	destroyTooltips($element: angular.IAugmentedJQuery) {
		const tooltipElements = $element.find('[data-bs-toggle="tooltip"]');
		tooltipElements.each((index, el: HTMLElement) => {
			const tooltipInstance = bootstrap.Tooltip.getInstance(el);
			if (tooltipInstance) {
				tooltipInstance.dispose();
			}
		});
	}
}
