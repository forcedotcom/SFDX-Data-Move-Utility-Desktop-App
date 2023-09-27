import angular from 'angular';
import { ActionEvent, FaIcon } from '../../../common';
import { ITabItem } from '../../../models';
import { IBroadcastService } from '../../services';
import { AngularUtils } from '../../../utils';

/** Interface for the uiTabs controller. */
export type UiTabsController = angular.IController & {
    /** Adds a tab to the tabs collection. */
    addTab: (tab: ITabItem) => void;
    /** Sets the tabs collection. */
    setTabs: (tabs: ITabItem[]) => void;
    /** Sets the title of the specified tab. */
    setTabTitle: (tabId: string, title: string) => void;
};

/** Interface for the uiTabs scope. */
interface ItabsScope extends angular.IScope {
    /** The collection of tabs. */
    tabs: ITabItem[];
    /** Selects the specified tab. */
    selectTab: (tab: ITabItem) => void;
    /** The orientation of the tabs. */
    orientation: string;
    /** The on change event. */
    onChange: ActionEvent<ITabItem>;
}

export function uiTabs($broadcast: IBroadcastService): angular.IDirective {
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
            selectedTabId: '='
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
        controller: function ($scope: ItabsScope, $attrs: angular.IAttributes) {

            $scope.orientation = $scope.orientation || 'horizontal';
            $scope.tabs = [];
            $scope.id = AngularUtils.setElementId($scope, $attrs);
            let oldSelectedTabId = "";

            this.setTabs = function (tabs: ITabItem[]) {
                $scope.tabs = tabs;
                if ($scope.tabs.length === 1) {
                    if ($scope.selectedTabId != undefined) {
                        $scope.selectedTabId = tabs[0].tabId;
                    }
                    tabs[0].active = true;
                }
            };

            this.setTabTitle = function (tabId: string, title: string) {
                const tab = $scope.tabs.find(t => t.tabId === tabId);
                if (tab) {
                    tab.title = title;
                }
            };

            this.addTab = function (tab: ITabItem) {
                $scope.tabs.push(tab);
                if ($scope.tabs.length === 1) {
                    if ($scope.selectedTabId != undefined) {
                        $scope.selectedTabId = tab.tabId;
                    }
                    tab.active = true;
                }
            };

            $scope.selectTab = function (tab: ITabItem) {
                angular.forEach($scope.tabs, (t) => {
                    t.active = false;
                });
                tab.active = true;
                if ($scope.selectedTabId != undefined) {
                    $scope.selectedTabId = tab.tabId;
                }
                if (oldSelectedTabId != tab.tabId) {
                    if ($scope.onChange) {
                        $scope.onChange({
                            args: {
                                componentId: $scope.id,
                                args: [tab]
                            }
                        });
                    }
                    $broadcast.broadcastAction<ITabItem>('tabSelected', 'uiTabs', {
                        componentId: $scope.id,
                        args: [tab]
                    });
                    oldSelectedTabId = tab.tabId;
                }
            };

            $scope.$watch('selectedTabId', (newVal: string) => {
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

export function uiTab(): angular.IDirective {
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
        link: function ($scope: ITabItem, $elem, $attrs, $uiTabsCtrl: UiTabsController) {
            $scope.active = false;
            $scope.iconClass = FaIcon[$scope.icon] || $scope.icon || '';
            $uiTabsCtrl.addTab($scope);
        }
    };
}

export const uiTabsDirectiveModule = angular.module('uiTabsDirectiveModule', [])
    .directive('uiTabs', ['$broadcast', uiTabs])
    .directive('uiTab', uiTab);