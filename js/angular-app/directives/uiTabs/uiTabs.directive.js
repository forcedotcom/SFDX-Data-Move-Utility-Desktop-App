"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiTabsDirectiveModule = exports.uiTab = exports.uiTabs = void 0;
const angular_1 = __importDefault(require("angular"));
const common_1 = require("../../../common");
const utils_1 = require("../../../utils");
function uiTabs($broadcast) {
    return {
        restrict: 'E',
        transclude: {
            tabsHeader: '?tabsHeader',
            uiTab: 'uiTab'
        },
        scope: {
            orientation: '@',
            onChange: '&',
            tabContentClass: '@',
            tabsHeight: '@',
            selectedTabId: '=',
            id: '@'
        },
        template: `
            <div ng-class="{'flex-row': orientation === 'horizontal', 'row': orientation === 'vertical'}">
                
                <ul style="height: {{ tabsHeight }};" class="nav" ng-class="{'nav-tabs border-bottom': orientation === 'horizontal', 'nav-pills col d-flex flex-column flex-shrink-0 border-end': orientation === 'vertical'}" role="tablist">

                    <!-- Tabs header placeholder -->
                    <li ng-transclude="tabsHeader"></li>

                    <!-- Tabs -->                    
                    <li data-tab-id="{{ tab.tabId }}" class="nav-item" ng-repeat="tab in tabs">
                        <a class="nav-link" ng-class="{active: tab.active}" ng-click="selectTab(tab)">
                            <i ng-if="tab.icon" class="{{tab.iconClass}}"></i> {{tab.title}}
                        </a>
                    </li>
                </ul>

                <!-- Tab content -->
                <div class="tab-content p-2 {{ tabContentClass }}" 
                        ng-class="{'': orientation === 'horizontal', 'col flex-grow-1' : orientation === 'vertical' }" ng-transclude="uiTab">
                    <!-- Tabs placeholder -->
                </div>

            </div>
        `,
        controller: function ($scope) {
            $scope.orientation = $scope.orientation || 'horizontal';
            $scope.tabs = [];
            $scope.id || ($scope.id = utils_1.CommonUtils.randomString());
            let oldSelectedTabId = "";
            this.setTabs = function (tabs) {
                $scope.tabs = tabs;
                if ($scope.tabs.length === 1) {
                    if ($scope.selectedTabId != undefined) {
                        $scope.selectedTabId = tabs[0].tabId;
                    }
                    tabs[0].active = true;
                }
            };
            this.setTabTitle = function (tabId, title) {
                const tab = $scope.tabs.find(t => t.tabId === tabId);
                if (tab) {
                    tab.title = title;
                }
            };
            this.addTab = function (tab) {
                $scope.tabs.push(tab);
                if ($scope.tabs.length === 1) {
                    $scope.selectedTabId = tab.tabId;
                    tab.active = true;
                }
            };
            $scope.selectTab = function (tab) {
                angular_1.default.forEach($scope.tabs, (tab) => {
                    tab.active = false;
                });
                tab.active = true;
                $scope.selectedTabId = tab.tabId;
                if (oldSelectedTabId != tab.tabId) {
                    if ($scope.onChange) {
                        const abortChange = $scope.onChange({
                            args: {
                                componentId: $scope.id,
                                args: [tab]
                            }
                        });
                        if (abortChange) {
                            $scope.selectedTabId = oldSelectedTabId;
                            tab.active = false;
                            angular_1.default.forEach($scope.tabs, (tab) => {
                                if (tab.tabId == oldSelectedTabId) {
                                    tab.active = true;
                                }
                            });
                            return;
                        }
                    }
                    $broadcast.broadcastAction('tabSelected', 'uiTabs', {
                        componentId: $scope.id,
                        args: [tab]
                    });
                    oldSelectedTabId = tab.tabId;
                }
            };
            $scope.$watch('selectedTabId', (newVal) => {
                if (newVal) {
                    const tab = $scope.tabs.find(t => t.tabId === newVal);
                    if (tab) {
                        $scope.selectTab(tab);
                    }
                }
            });
        }
    };
}
exports.uiTabs = uiTabs;
function uiTab() {
    return {
        restrict: 'E',
        transclude: true,
        require: '^uiTabs',
        scope: {
            title: '@',
            icon: '@',
            tabId: '@'
        },
        template: `
            <div class="tab-pane fade" 
                    ng-class="{'d-none': !active, show: active, active: active}" ng-transclude>
                <!-- Tab content placeholder -->
            </div>
        `,
        link: function ($scope, $elem, $attrs, $uiTabsCtrl) {
            $scope.active = false;
            $scope.iconClass = common_1.FaIcon[$scope.icon] || $scope.icon || '';
            $uiTabsCtrl.addTab($scope);
        }
    };
}
exports.uiTab = uiTab;
exports.uiTabsDirectiveModule = angular_1.default.module('uiTabsDirectiveModule', [])
    .directive('uiTabs', ['$broadcast', uiTabs])
    .directive('uiTab', uiTab);
//# sourceMappingURL=uiTabs.directive.js.map