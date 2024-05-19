"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiAccordionDirectiveModule = exports.uiAccordionTab = exports.uiAccordionTabs = void 0;
const angular_1 = __importDefault(require("angular"));
const utils_1 = require("../../../utils");
function uiAccordionTabs() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            id: '@',
            selectedItem: '=',
            allowMultipleOpenTabs: '='
        },
        template: `
            <div class="accordion" ng-transclude>
                <!-- Accordion tabs placeholder -->
            </div>
        `,
        controller: function ($scope) {
            $scope.items = [];
            $scope.id || ($scope.id = utils_1.CommonUtils.randomString());
            this.addItem = function (item) {
                $scope.items.push(item);
                if ($scope.items.length === 1 && !$scope.selectedItem) {
                    this.selectItem(item);
                }
                else if (!!$scope.selectedItem
                    && $scope.selectedItem === $scope.items.indexOf(item)) {
                    this.selectItem(item);
                }
            };
            let _supressSelectEvent = false;
            this.selectItem = function (item, supressNextEvent = true) {
                if (!item)
                    return;
                angular_1.default.forEach($scope.items, (i) => {
                    i.active = $scope.allowMultipleOpenTabs ? i.active : false;
                });
                item.active = $scope.allowMultipleOpenTabs ? !item.active : true;
                if ($scope.selectedItem != undefined) {
                    $scope.selectedItem = $scope.items.indexOf(item);
                }
                _supressSelectEvent = supressNextEvent;
            };
            $scope.$watch('selectedItem', (newVal) => {
                if (_supressSelectEvent) {
                    _supressSelectEvent = false;
                    return;
                }
                this.selectItem($scope.items[newVal], false);
            });
        }
    };
}
exports.uiAccordionTabs = uiAccordionTabs;
function uiAccordionTab() {
    return {
        restrict: 'E',
        transclude: true,
        require: '^uiAccordionTabs',
        scope: {
            title: '@',
            tabId: '@'
        },
        template: `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button" type="button" ng-click="selectItem()"
                        ng-class="{'collapsed': !active}" aria-expanded="{{active}}">
                        {{title}}
                    </button>
                </h2>
                <div class="accordion-collapse collapse" ng-class="{'show': active}">
                    <div class="accordion-body" ng-transclude>
                        <!-- Accordion item content placeholder -->
                    </div>
                </div>
            </div>
        `,
        link: function ($scope, $elem, $attrs, $uiAccordionCtrl) {
            $scope.tabId = $scope.tabId || utils_1.CommonUtils.randomString();
            $uiAccordionCtrl.addItem($scope);
            $scope.selectItem = function () {
                $uiAccordionCtrl.selectItem($scope);
            };
        }
    };
}
exports.uiAccordionTab = uiAccordionTab;
exports.uiAccordionDirectiveModule = angular_1.default.module('uiAccordionDirectiveModule', [])
    .directive('uiAccordionTabs', uiAccordionTabs)
    .directive('uiAccordionTab', uiAccordionTab);
//# sourceMappingURL=uiAccordionTabs.directive.js.map