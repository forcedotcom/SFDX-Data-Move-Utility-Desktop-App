import angular from "angular";
import { IActionEventArgParam, IOption } from "../../../models";
import { AngularUtils, CommonUtils } from "../../../utils";
import { IBroadcastService } from "../../services";

interface IWizardStepScope extends angular.IScope {
    steps: IOption[];
    currentStep: number;
    id: string;
}

class WizardStepController {

    static $inject = ['$broadcast', '$scope'];

    steps: IOption[];
    id: string;

    currentStep: number;

    constructor(private $broadcast: IBroadcastService, private $scope: angular.IScope) {

        this.$broadcast.onAction('setCurrentStep', 'uiWizardStep', (args: IActionEventArgParam<number>) => {
            if (args.componentId != this.id) return;
            AngularUtils.$apply(this.$scope, () => {
                this.currentStep = args.args[0];
            });
        }, this.$scope);

        this.$broadcast.onAction('setSteps', 'uiWizardStep', (args: IActionEventArgParam<IOption>) => {
            if (args.componentId != this.id) return;
            AngularUtils.$apply(this.$scope, () => {
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

export const uiWizardDirectiveModule = angular.module('uiWizardDirectiveModule', [])
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
            link: ($scope: IWizardStepScope) => {
                $scope.id ||= CommonUtils.randomString();
            }
        };
    });



