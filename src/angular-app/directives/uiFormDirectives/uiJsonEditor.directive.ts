import angular from 'angular';
import bootstrap from 'bootstrap';

import { ActionEvent, FaIcon, SetupFormOptions } from '../../../common';
import { IFormController, ISetupFormOption } from '../../../models';
import { CommonUtils } from '../../../utils';
import { IBroadcastService, ITranslationService } from '../../services';



interface IUiJsonEditorScope extends angular.IScope {
    setup: SetupFormOptions;
    json: any;
    onChange: ActionEvent<any>;
    formClass: string;
    disabled: boolean;
    hideLabels: boolean;
    inputsInRow: number;
}

export class UiJsonEditorController implements angular.IController, IFormController {

    static $inject = ["$element", "$timeout", '$translate', '$broadcast'];

    json: any;
    setup: SetupFormOptions;
    inputsInRow: number;
    onChange: ActionEvent<any>;

    jsonCopy: any;
    setupCopy: SetupFormOptions;
    groupedSetupCopy = [];

    oldJsonCopy: any;
    id: string;

    constructor(private $element: angular.IAugmentedJQuery,
        private $timeout: angular.ITimeoutService,
        private $translate: ITranslationService,
        private $broadcast: IBroadcastService) { }

    validate = () => {
        let valid = true;
        for (const key in this.setupCopy) {
            if (this.setupCopy[key].required && !this.setupCopy[key].disabled && !this.jsonCopy[key]) {
                this.setupCopy[key].validationStatus = false;
                valid = false;
            } else {
                this.setupCopy[key].validationStatus = true;
            }
        }
        return valid;
    }

    resetValidation = () => {
        for (const key in this.jsonCopy) {
            this.setupCopy[key].validationStatus = null;
        }
    }

    handleJsonChange() {

        if (CommonUtils.deepEquals(this.jsonCopy, this.oldJsonCopy, false, true)) return;
        this.oldJsonCopy = CommonUtils.deepClone(this.jsonCopy);

        this.updateTooltip((element, tooltip) => {
            if (tooltip) {
                tooltip.hide();
            }
        });
        this.$broadcast.broadcastAction('onChange', 'uiJsonEditor', {
            componentId: this.id,
            args: [this.jsonCopy]
        });
        if (this.onChange) {
            this.onChange({
                args: {
                    args: [this.jsonCopy]
                }
            });
        }
    }

    handleButtonClick(option: ISetupFormOption) {
        this.updateTooltip((element, tooltip) => {
            if (tooltip) {
                tooltip.hide();
            }
        });
        this.$broadcast.broadcastAction('onChange', 'uiJsonEditor', {
            componentId: this.id,
            args: [this.jsonCopy, option]
        });
        if (this.onChange) {
            this.onChange({
                args: {
                    args: [this.jsonCopy, option]
                }
            });
        }
    }

    updateJsonCopy() {
        this.jsonCopy = CommonUtils.deepClone(this.json);
        this.oldJsonCopy = CommonUtils.deepClone(this.json);
    }

    setJson(json: any) {
        this.json = json;
        this.updateJsonCopy();
    }

    updateSetupCopy() {

        if (!this.setup) return;

        this.setupCopy = CommonUtils.deepClone(this.setup);

        this.inputsInRow ||= 1;
        this.groupedSetupCopy = [];

        const keys = Object.keys(this.setupCopy);
        let tempArray = {};
        let tempWidth = 0;

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const item = this.setupCopy[key];
            const itemWidth = item.widthOf12 || (12 / this.inputsInRow);

            if (item.singleElementInRow || itemWidth >= 12) {
                if (Object.keys(tempArray).length > 0) {
                    this.groupedSetupCopy.push(tempArray);
                    tempArray = {};
                    tempWidth = 0;
                }
                this.groupedSetupCopy.push({ [key]: item });
            } else {
                if (tempWidth + itemWidth > 12) {
                    this.groupedSetupCopy.push(tempArray);
                    tempArray = {};
                    tempWidth = 0;
                }
                tempArray[key] = item;
                tempWidth += itemWidth;
            }
        }

        if (Object.keys(tempArray).length > 0) {
            this.groupedSetupCopy.push(tempArray);
        }

        Object.values(this.setupCopy).forEach((setupOption: ISetupFormOption) => {

            if (setupOption.type != 'button') {
                setupOption.icon ||= FaIcon.questionCircle;
            }

            if (setupOption.type == 'select') {
                if (!setupOption.options.some(o => o.value == '')) {
                    setupOption.options.unshift({
                        value: undefined,
                        label: setupOption.placeholder || this.$translate.translate({ key: 'SELECT_PLACEHOLDER' })
                    });
                }
            } else if (setupOption.type == 'autocomplete' || setupOption.type == 'input') {
                setupOption.placeholder ||= this.$translate.translate({ key: 'INPUT_PLACEHOLDER' });
            }
        });

        this.$timeout(() => {
            this.updateTooltip((element, tooltip) => {
                if (tooltip) {
                    tooltip.dispose();
                }
                new bootstrap.Tooltip(element);
            });
        }, 50);
    }

    updateTooltip(callback: (element, tooltip) => void) {
        this.$element.find('[data-bs-toggle="tooltip"]').each(function () {
            const tooltip = bootstrap.Tooltip.getInstance(this);
            callback(this, tooltip);
        });
    }
}

export class UiJsonEditor implements angular.IDirective {
    restrict = 'E';
    controller = UiJsonEditorController;
    controllerAs = '$ctrl';
    bindToController = true;
    scope = {
        id: '@',
        setup: '<',
        json: '<',
        onChange: '&',
        formClass: '@',
        firstFormClass: '@',
        itemFormClass: '@',
        rowTitleClass: '@',
        disabled: '=',
        hideLabels: '=',
        inputsInRow: '<',
        rowTitles: '<',
        addHelpLinks: '<'
    };

    template = `
    <div ng-repeat="row in $ctrl.groupedSetupCopy" class="row {{ $ctrl.formClass }}"
                    ng-class="{ [$ctrl.firstFormClass] : $index == 0 }">
        <div class="col-md-12 ps-0" ng-if="$ctrl.rowTitles && $ctrl.rowTitles[$index]">
            <label ng-if="!!$ctrl.rowTitles[$index]" class="text-info ms-0 fw-bold mb-0 {{ $ctrl.rowTitleClass  }}">
                {{ $ctrl.rowTitles[$index] }}
            </label>
            <hr class="m-0 p-0 mb-1"/>
        </div>
        <div ng-repeat="(key, _) in row" 
            style="{{ $ctrl.setupCopy[key].style }}"
            data-key="{{ key }}"
            ng-class="{ 
                'col-md-12': $ctrl.setupCopy[key].singleElementInRow, 
                ['col-md-' + $ctrl.setupCopy[key].widthOf12]: $ctrl.setupCopy[key].widthOf12,
                ['col-md-' + (12 / $ctrl.inputsInRow)]: !$ctrl.setupCopy[key].singleElementInRow && !$ctrl.setupCopy[key].widthOf12,               
                [ $ctrl.setupCopy[key].formClass]: true,
                [ $ctrl.itemFormClass]: true,
                'form-group': true
            }">
                <!-- Label -->
                <ui-label ng-if="!$ctrl.hideLabels && $ctrl.setupCopy[key].type !== 'button' && $ctrl.setupCopy[key].type !== 'divider'"
                        label="{{ $ctrl.setupCopy[key].label }}"
                        icon="{{ $ctrl.setupCopy[key].icon }}"
                        icon-tooltip="{{ $ctrl.setupCopy[key].popover }}"
                        help-search-word="{{ $ctrl.setupCopy[key].helpSearchWord }}"
                        add-help-links="$ctrl.addHelpLinks || $ctrl.setupCopy[key].addHelpLinks">
                </ui-label>


                <!-- Input -->
                <ui-input ng-if="$ctrl.setupCopy[key].type === 'input' || $ctrl.setupCopy[key].type === 'number'" 
                        type="{{ $ctrl.setupCopy[key].type }}"
                        min="{{ $ctrl.setupCopy[key].min }}"
                        max="{{ $ctrl.setupCopy[key].max }}"
                        ng-model="$ctrl.jsonCopy[key]" 
                        placeholder="{{ $ctrl.setupCopy[key].placeholder }}"
                        ng-class="{'is-invalid': $ctrl.setupCopy[key].validationStatus === false}" 
                        disabled="$ctrl.disabled || $ctrl.setupCopy[key].disabled"></ui-input>

                <!-- Textarea -->
                <ui-textarea ng-if="$ctrl.setupCopy[key].type === 'textarea'" 
                        ng-model="$ctrl.jsonCopy[key]" 
                        placeholder="{{ $ctrl.setupCopy[key].placeholder }}"
                        ng-class="{'is-invalid': $ctrl.setupCopy[key].validationStatus === false}" 
                        disabled="$ctrl.disabled || $ctrl.setupCopy[key].disabled"></ui-textarea>                    

                <!-- Select -->
                <ui-select ng-if="$ctrl.setupCopy[key].type === 'select'" 
                        ng-model="$ctrl.jsonCopy[key]" 
                        options="$ctrl.setupCopy[key].options" 
                        ng-class="{'is-invalid': $ctrl.setupCopy[key].validationStatus === false}" 
                        disabled="$ctrl.disabled || $ctrl.setupCopy[key].disabled"></ui-select>

                <!-- Autocomplete -->
                <ui-autocomplete ng-if="$ctrl.setupCopy[key].type === 'autocomplete'" 
                        ng-model="$ctrl.jsonCopy[key]" 
                        options="$ctrl.setupCopy[key].options" 
                        placeholder="{{ $ctrl.setupCopy[key].placeholder }}"
                        ng-class="{'is-invalid': $ctrl.setupCopy[key].validationStatus === false}" 
                        disabled="$ctrl.disabled || $ctrl.setupCopy[key].disabled"
                        allow-unlisted-input="$ctrl.setupCopy[key].allowUnlistedInput"></ui-autocomplete>

                <!-- Toggle -->
                <ui-toggle ng-if="$ctrl.setupCopy[key].type === 'toggle'" 
                        ng-model="$ctrl.jsonCopy[key]"
                        disabled="$ctrl.disabled || $ctrl.setupCopy[key].disabled"></ui-toggle>

                <!-- Button -->
                <ui-button ng-if="$ctrl.setupCopy[key].type === 'button'" 
                        button-style="{{ $ctrl.setupCopy[key].buttonStyle }}" 
                        data-bs-toggle="tooltip"
                        size="{{ $ctrl.setupCopy[key].buttonSize }}"
                        disabled="$ctrl.disabled || $ctrl.setupCopy[key].disabled"
                        title="{{ $ctrl.setupCopy[key].popover }}" 
                        on-click="$ctrl.handleButtonClick($ctrl.setupCopy[key])">                        
                            <!-- button icon -->
                            <i ng-if="$ctrl.setupCopy[key].icon" class="{{ $ctrl.setupCopy[key].icon }}"></i>

                            <!-- button label -->
                            {{ $ctrl.setupCopy[key].label }}                        
                </ui-button>

                <!-- Divider -->
                <ui-divider ng-if="$ctrl.setupCopy[key].type === 'divider'"></ui-divider>

                <!-- Validation -->
                <div ng-if="$ctrl.setupCopy[key].validationStatus === false" class="text-danger form-control-error">
                    {{ 'THIS_FIELD_IS_REQUIRED' | translate }}
                </div>

            </div>
        </div>
    `;

    link = ($scope: IUiJsonEditorScope, $element: angular.IAugmentedJQuery, $attrs: angular.IAttributes, $ctrl: UiJsonEditorController) => {
        $scope.id ||= CommonUtils.randomString();
        $scope.$watch(() => $ctrl.jsonCopy, () => $ctrl.handleJsonChange(), true);
        $scope.$watch(() => $ctrl.json, () => $ctrl.updateJsonCopy(), true);
        $scope.$watch(() => $ctrl.setup, () => $ctrl.updateSetupCopy(), true);

        $scope.$on('$destroy', () => {
            $ctrl.updateTooltip((element, tooltip) => {
                if (tooltip) {
                    tooltip.dispose();
                }
            });
        });
    }
}
