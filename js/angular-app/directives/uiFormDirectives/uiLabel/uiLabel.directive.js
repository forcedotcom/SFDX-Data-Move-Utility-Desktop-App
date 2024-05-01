"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiLabel = void 0;
const bootstrap_1 = __importDefault(require("bootstrap"));
const services_1 = require("../../../../services");
class UiLabel {
    constructor() {
        this.restrict = 'E';
        this.template = `
		<label class="form-label fw-bold">
			{{ $ctrl.label }}
			<i ng-if="$ctrl.iconTooltip" class="{{ $ctrl.icon }}" data-bs-toggle="tooltip" title="{{ $ctrl.iconTooltip }}"></i>
			<a data-bs-toggle="tooltip"	title="{{ 'CLICK_TO_NAVIGATE_TO_HELP_ARTICLE' | translate }}"
				ng-if="$ctrl.addHelpLinks" href="javascript:void(0)"
				ng-click="$ctrl.navigateToHelpArticle($ctrl.helpSearchWord || $ctrl.label)"
				class="text-primary-dashed">
					<i class="fa fa-link fa-sm"></i>
			</a>
		</label>
    `;
        this.controller = UiLabelController;
        this.controllerAs = '$ctrl';
        this.bindToController = true;
        this.scope = {
            label: '@',
            icon: '@',
            iconTooltip: '@',
            helpSearchWord: '@',
            addHelpLinks: '<'
        };
        this.link = ($scope, $element, $attrs, $ctrl) => {
            $scope.$on('$destroy', () => {
                $ctrl.destroyTooltips();
            });
            $scope.$watch('$ctrl.iconTooltip', () => {
                $ctrl.setTooltips();
            });
        };
    }
}
exports.UiLabel = UiLabel;
class UiLabelController {
    constructor($timeout) {
        this.$timeout = $timeout;
    }
    navigateToHelpArticle(searchTerm) {
        services_1.SfdmuService.navigateToHelpArticle(searchTerm);
    }
    setTooltips() {
        this.$timeout(() => {
            this.destroyTooltips();
            const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            tooltipElements.forEach(el => {
                new bootstrap_1.default.Tooltip(el);
            });
        }, 50);
    }
    destroyTooltips() {
        const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipElements.forEach(el => {
            const tooltipInstance = bootstrap_1.default.Tooltip.getInstance(el);
            if (tooltipInstance) {
                tooltipInstance.dispose();
            }
        });
    }
}
UiLabelController.$inject = ['$timeout'];
//# sourceMappingURL=uiLabel.directive.js.map