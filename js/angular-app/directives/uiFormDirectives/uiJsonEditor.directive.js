"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiJsonEditor = exports.UiJsonEditorController = void 0;
const bootstrap_1 = __importDefault(require("bootstrap"));
const common_1 = require("../../../common");
const services_1 = require("../../../services");
const utils_1 = require("../../../utils");
class UiJsonEditorController {
    constructor($element, $timeout, $translate, $broadcast) {
        this.$element = $element;
        this.$timeout = $timeout;
        this.$translate = $translate;
        this.$broadcast = $broadcast;
        this.groupedSetupCopy = [];
        this.validate = () => {
            let valid = true;
            for (const key in this.setupCopy) {
                if (this.setupCopy[key].required && !this.jsonCopy[key]) {
                    this.setupCopy[key].validationStatus = false;
                    valid = false;
                }
                else {
                    this.setupCopy[key].validationStatus = true;
                }
            }
            return valid;
        };
        this.resetValidation = () => {
            for (const key in this.jsonCopy) {
                this.setupCopy[key].validationStatus = null;
            }
        };
    }
    handleJsonChange() {
        if (utils_1.CommonUtils.deepEquals(this.jsonCopy, this.oldJsonCopy, false, true))
            return;
        this.oldJsonCopy = utils_1.CommonUtils.deepClone(this.jsonCopy);
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
    handleButtonClick(option) {
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
        this.jsonCopy = utils_1.CommonUtils.deepClone(this.json);
        this.oldJsonCopy = utils_1.CommonUtils.deepClone(this.json);
    }
    setJson(json) {
        this.json = json;
        this.updateJsonCopy();
    }
    updateSetupCopy() {
        if (!this.setup)
            return;
        this.setupCopy = utils_1.CommonUtils.deepClone(this.setup);
        this.inputsInRow || (this.inputsInRow = 1);
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
            }
            else {
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
        Object.values(this.setupCopy).forEach((setupOption) => {
            if (setupOption.type != 'button') {
                setupOption.icon || (setupOption.icon = common_1.FaIcon.questionCircle);
            }
            if (setupOption.type == 'select') {
                if (!setupOption.options.some(o => o.value == '')) {
                    setupOption.options.unshift({
                        value: undefined,
                        label: setupOption.placeholder || this.$translate.translate({ key: 'SELECT_PLACEHOLDER' })
                    });
                }
            }
            else if (setupOption.type == 'autocomplete' || setupOption.type == 'input') {
                setupOption.placeholder || (setupOption.placeholder = this.$translate.translate({ key: 'INPUT_PLACEHOLDER' }));
            }
        });
        this.$timeout(() => {
            this.updateTooltip((element, tooltip) => {
                if (tooltip) {
                    tooltip.dispose();
                }
                new bootstrap_1.default.Tooltip(element);
            });
        }, 50);
    }
    updateTooltip(callback) {
        this.$element.find('[data-bs-toggle="tooltip"]').each(function () {
            const tooltip = bootstrap_1.default.Tooltip.getInstance(this);
            callback(this, tooltip);
        });
    }
    navigateToHelpArticle(searchTerm) {
        services_1.SfdmuService.navigateToHelpArticle(searchTerm);
    }
}
exports.UiJsonEditorController = UiJsonEditorController;
UiJsonEditorController.$inject = ["$element", "$timeout", '$translate', '$broadcast'];
class UiJsonEditor {
    constructor() {
        this.restrict = 'E';
        this.controller = UiJsonEditorController;
        this.controllerAs = '$ctrl';
        this.bindToController = true;
        this.scope = {
            setup: '<',
            json: '<',
            onChange: '&',
            formClass: '@',
            disabled: '=',
            hideLabels: '=',
            inputsInRow: '<',
            rowTitles: '<',
            addHelpLinks: '<'
        };
        this.template = `
    <div ng-repeat="row in $ctrl.groupedSetupCopy" class="row {{ $ctrl.formClass }}">
        <div class="col-md-12" ng-if="$ctrl.rowTitles && $ctrl.rowTitles[$index]">
            <label class="text-info fw-bold mb-0 mt-2">
                {{ $ctrl.rowTitles[$index] }}
            </label>
            <hr class="m-0 p-0 mb-1"/>
        </div>
        <div ng-repeat="(key, _) in row" 
            data-key="{{ key }}"
            ng-class="{ 
                'col-md-12': $ctrl.setupCopy[key].singleElementInRow, 
                ['col-md-' + $ctrl.setupCopy[key].widthOf12]: $ctrl.setupCopy[key].widthOf12,
                ['_ col-md-' + (12 / $ctrl.inputsInRow)]: !$ctrl.setupCopy[key].singleElementInRow && !$ctrl.setupCopy[key].widthOf12,               
                [ $ctrl.setupCopy[key].formClass]: true
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
                <div ng-if="$ctrl.setupCopy[key].validationStatus === false" class="text-danger">
                    {{ 'THIS_FIELD_IS_REQUIRED' | translate }}
                </div>

            </div>
        </div>
    `;
        this.link = ($scope, $element, $attrs, $ctrl) => {
            $ctrl.id = utils_1.AngularUtils.setElementId($scope, $attrs);
            $attrs.$observe('id', (value) => {
                if (value != $attrs.id) {
                    $ctrl.id = utils_1.AngularUtils.setElementId($scope, $attrs);
                }
            });
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
        };
    }
}
exports.UiJsonEditor = UiJsonEditor;
//# sourceMappingURL=uiJsonEditor.directive.js.map