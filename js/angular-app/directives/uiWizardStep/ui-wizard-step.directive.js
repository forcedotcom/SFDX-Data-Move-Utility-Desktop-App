"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiWizardDirectiveModule = void 0;
const angular_1 = __importDefault(require("angular"));
const utils_1 = require("../../../utils");
class WizardStepController {
    constructor($broadcast, $scope) {
        this.$broadcast = $broadcast;
        this.$scope = $scope;
        this.$broadcast.onAction('setCurrentStep', 'uiWizardStep', (args) => {
            if (args.componentId != this.id)
                return;
            utils_1.AngularUtils.$apply(this.$scope, () => {
                this.currentStep = args.args[0];
            });
        }, this.$scope);
        this.$broadcast.onAction('setSteps', 'uiWizardStep', (args) => {
            if (args.componentId != this.id)
                return;
            utils_1.AngularUtils.$apply(this.$scope, () => {
                this.steps = args.args;
            });
        }, this.$scope);
        this.$scope.$watch(() => this.currentStep, () => {
            global.appGlobal.wizardStep = this.currentStep;
            this.$broadcast.broadcastAction('onStepChanged', 'uiWizardStep', {
                args: [this.currentStep]
            });
        });
    }
}
WizardStepController.$inject = ['$broadcast', '$scope'];
exports.uiWizardDirectiveModule = angular_1.default.module('uiWizardDirectiveModule', [])
    .controller('WizardStepController', WizardStepController)
    .directive('uiWizardStep', () => {
    return {
        restrict: 'E',
        template: `
                <div class="wizard-steps">
                    <div class="wizard-line" ng-style="{backgroundColor: $ctrl.currentStep > $index + 1 ? '--bs-success' : '--bs-white'}"></div>
                    <div class="wizard-step" ng-repeat="step in $ctrl.steps">
                        <div class="wizard-circle" ng-class="{completed: $ctrl.currentStep > $index + 1, active: $ctrl.currentStep == $index + 1}">
                            {{$index + 1}}
                        </div>
                        <div class="wizard-label" ng-class="{completed: $ctrl.currentStep > $index + 1, active: $ctrl.currentStep == $index + 1}">
                            {{step.label}}
                        </div>
                    </div>
                </div>
            `,
        scope: {
            id: '@',
            steps: '<',
            currentStep: '<'
        },
        controller: 'WizardStepController',
        controllerAs: '$ctrl',
        bindToController: true,
        link: ($scope) => {
            $scope.id || ($scope.id = utils_1.CommonUtils.randomString());
        }
    };
});
//# sourceMappingURL=ui-wizard-step.directive.js.map