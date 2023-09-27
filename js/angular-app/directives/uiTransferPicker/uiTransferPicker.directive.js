"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiTransferPickerDirective = void 0;
const bootstrap_1 = __importDefault(require("bootstrap"));
const utils_1 = require("../../../utils");
class UiTransferPickerDirective {
    constructor($translate, $timeout) {
        this.$translate = $translate;
        this.$timeout = $timeout;
        this.restrict = 'E';
        this.scope = {
            selected: '=',
            source: '=',
            onSelect: '&',
            height: '@',
            sourceItemsTitle: '@',
            selectedItemsTitle: '@',
        };
        this.template = '<div class="transfer" style="direction:ltr"></div>';
    }
    link($scope, $element, $attrs) {
        // Assign default values to the scope
        Object.assign($scope, {
            id: utils_1.AngularUtils.setElementId($scope, $attrs),
            height: $scope.height || "390px",
            // For the properties below, the default values are now set hard-coded,
            // but we can also set them dynamically from outside the directive upon need.
            sourceItemsTitle: $scope.selectedItemsTitle || this.$translate.translate({ key: 'AVAILABLE_ITEMS' }),
            selectedItemsTitle: $scope.selectedItemsTitle || this.$translate.translate({ key: 'SELECTED_ITEMS' }),
            searchPlaceholderText: this.$translate.translate({ key: 'SEARCH_PLACEHOLDER' }),
            totalTextTemplate: this.$translate.translate({ key: 'TOTAL_ITEMS' }),
            groupItemProperty: 'label',
            groupValueProperty: 'value',
            tooltipProperty: 'popover',
            groupByProperty: 'group',
            errorMessageProperty: 'errorMessage'
        });
        let cachedGroupData = [];
        let tooltips = [];
        const setup = (newValue) => {
            if (!utils_1.CommonUtils.deepEquals(newValue, cachedGroupData)) {
                cachedGroupData = angular.copy(newValue);
                const groupDataArray = newValue.groupByProp($scope.groupByProperty, 'groupItem', 'groupArray');
                groupDataArray.forEach(data => {
                    data.groupArray.forEach((item) => {
                        if ($scope.selected && $scope.selected.includes(String(item.value))) {
                            item.selected = true;
                        }
                    });
                });
                $element.find('.transfer')
                    .empty()
                    .transfer({
                    groupDataArray,
                    labelName: $scope.groupItemProperty,
                    valueName: $scope.groupValueProperty,
                    leftTabNameText: $scope.sourceItemsTitle,
                    rightTabNameText: $scope.selectedItemsTitle,
                    searchPlaceholderText: $scope.searchPlaceholderText,
                    totalTextTemplate: $scope.totalTextTemplate,
                    dataErrorName: $scope.errorMessageProperty,
                    tooltipName: $scope.tooltipProperty,
                    callable: (items) => {
                        setTooltips();
                        if ($scope.onSelect) {
                            $scope.onSelect({
                                args: {
                                    componentId: $scope.id,
                                    args: items
                                }
                            });
                        }
                    },
                    onInit: onInit,
                });
            }
        };
        const refresh = () => {
            const oldData = cachedGroupData;
            cachedGroupData = [];
            setup(oldData);
        };
        const onInit = () => {
            // Set component height
            $element.find('.transfer-double').css('height', $scope.height);
            $element.find('.transfer-double-content-left,.transfer-double-content-right').attr('style', `height: calc(${$scope.height} - 70px);`);
            $element.find('.transfer-double-list-main,.transfer-double-selected-list-main').attr('style', `height: calc(${$scope.height} - 180px);`);
            $element.find('.transfer-double-content-middle').attr('style', `bottom: calc((${$scope.height} - 180px) / 2 + 5px); top: auto;`);
            // Set component tooltips
            setTooltips();
        };
        const setTooltips = () => {
            this.$timeout(() => {
                tooltips.forEach((tooltip) => {
                    try {
                        tooltip.dispose();
                    }
                    catch (e) { }
                });
                tooltips = [];
                $element.find('[data-bs-toggle="tooltip"]').each((_, element) => {
                    tooltips.push(new bootstrap_1.default.Tooltip(element));
                });
            }, 100, false);
        };
        $scope.$watchCollection('source', setup);
        $scope.$watchCollection('selected', (newValue, oldValue) => {
            if (!utils_1.CommonUtils.deepEquals(newValue, oldValue)) {
                refresh();
            }
        });
    }
}
exports.UiTransferPickerDirective = UiTransferPickerDirective;
//# sourceMappingURL=uiTransferPicker.directive.js.map