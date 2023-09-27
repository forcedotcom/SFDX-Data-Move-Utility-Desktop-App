"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiMenuDirective = void 0;
const utils_1 = require("../../../utils");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const uiMenuDirective = ($compile, $app) => {
    return {
        restrict: 'E',
        scope: {
            navbarClass: '@',
            navbarNavClass: '@',
            addToggler: '=',
            source: '<'
        },
        transclude: {
            'brand': '?navbarBrand',
            'body': '?navbarBody',
            'form': '?navbarForm'
        },
        template: `
			<div class="navbar navbar-expand-lg {{ navbarClass }}">
				<div class="container-fluid">

					<span class="navbar-brand">
						<div ng-transclude="brand"></div>
					</span>

					<div ng-transclude="body"></div>

					<button ng-if="addToggler" class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar"
						aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation"><span
							class="navbar-toggler-icon"></span>
					</button>

					<nav class="collapse navbar-collapse" id="mainNavbar">
						<ul class="navbar-nav {{ navbarNavClass }}"></ul>
						<div class="d-flex" ng-transclude="form"></div>
					</nav>

				</div>
			</div>
		`,
        link: ($scope, $element, $attrs) => {
            utils_1.AngularUtils.setElementId($scope, $attrs);
            $scope.source || ($scope.source = []);
            $scope.itemClickHandler = (menuId, hasChildren) => {
                if (hasChildren)
                    return;
                const item = $scope.source.findDeep('id', menuId);
                if (item) {
                    $app.$broadcast.broadcastAction('onClick', 'uiMenu', {
                        action: item.action,
                        args: [item],
                        componentId: $attrs.id
                    });
                }
            };
            const renderItems = (source, level) => {
                let html = '';
                source.forEach(menuItem => {
                    menuItem.id || (menuItem.id = utils_1.CommonUtils.randomString());
                    const hasChildren = menuItem.children && menuItem.children.length;
                    if (menuItem.itemType == 'divider') {
                        html += '<li><hr class="dropdown-divider"></li>';
                    }
                    else {
                        html += `<li class="${hasChildren ? ' nav-item dropdown' + (level > 0 ? ' dropdown-submenu' : '') : ''} ${menuItem.disabled ? 'disabled' : ''}">`;
                        html += `<a class="${hasChildren || level == 0 ? 'dropdown-toggle dropdown-item ' + (level == 0 ? ' nav-link' : '') : 'dropdown-item'} ${menuItem.disabled ? 'disabled' : ''}" href="javascript:void(0)" ng-click="itemClickHandler('${menuItem.id}', ${hasChildren})">`;
                        if (menuItem.icons && menuItem.icons.length) {
                            html += `<i class="${menuItem.icons[0].icon} fa-fw"></i> `;
                        }
                        html += `${menuItem.title}</a>`;
                        if (hasChildren) {
                            if (level == 0) {
                                html += '<ul class="dropdown-menu">';
                            }
                            else {
                                html += '<ul class="dropdown-menu dropdown-menu-right">';
                            }
                            html += renderItems(menuItem.children, level + 1);
                            html += '</ul>';
                        }
                        html += '</li>';
                    }
                });
                return html;
            };
            const renderMenu = () => {
                const html = renderItems($scope.source, 0);
                if (!html) {
                    $element.find('.navbar-nav').empty();
                    return;
                }
                const contentsElement = $compile(html)($scope);
                $element.find('.navbar-nav').empty().append(contentsElement);
            };
            renderMenu();
            $scope.$watch('source', renderMenu, true);
            $app.$broadcast.onAction('setSource', 'uiMenu', (args) => {
                if (args.componentId != $attrs.id)
                    return;
                utils_1.AngularUtils.$apply($scope, () => {
                    $scope.source = args.args;
                });
            }, $scope);
        }
    };
};
exports.uiMenuDirective = uiMenuDirective;
//# sourceMappingURL=uiMenu.directive.js.map