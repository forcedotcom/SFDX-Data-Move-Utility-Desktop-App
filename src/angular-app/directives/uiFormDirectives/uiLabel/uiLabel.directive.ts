import angular from 'angular';
import bootstrap from 'bootstrap';
import { SfdmuService } from '../../../../services';

export class UiLabel implements angular.IDirective {
	restrict = 'E';
	template = `
		<label class="form-label fw-bold">
			{{ $ctrl.label }}
			<i ng-if="$ctrl.iconTooltip" class="{{ $ctrl.icon }}" data-bs-toggle="tooltip" title="{{ $ctrl.iconTooltip }}"></i>
			<a data-bs-toggle="tooltip"	title="{{ 'CLICK_TO_NAVIGATE_TO_HELP_ARTICLE' | translate }}"
				ng-if="$ctrl.addHelpLinks" href="javascript:void(0)"
				ng-click="$ctrl.navigateToHelpArticle($ctrl.helpSearchWord || $ctrl.label)">
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
			$ctrl.destroyTooltips();
		});
		$scope.$watch('$ctrl.iconTooltip', () => {
			$ctrl.setTooltips();
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

	setTooltips() {
		this.$timeout(() => {
			this.destroyTooltips();
			const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
			tooltipElements.forEach(el => {
				new bootstrap.Tooltip(el);
			});
		}, 50);
	}

	destroyTooltips() {
		const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
		tooltipElements.forEach(el => {
			const tooltipInstance = bootstrap.Tooltip.getInstance(el);
			if (tooltipInstance) {
				tooltipInstance.dispose();
			}
		});
	}
}
