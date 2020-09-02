/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

var exports = {};
const Controller = require("./javascripts/components/controller").Controller;

// Common Utils ///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
function getValueDeep(context, propertyPath) {
    return (function (expression) {
        return eval(expression);
    }).call(context, 'this.' + propertyPath);
}
function setValueDeep(context, propertyPath, value) {
    propertyPath = propertyPath.replace('[', '').replace(']', '');
    const propList = propertyPath.split('.');
    const key = propList.pop();
    const pointer = propList.reduce((acc, currentValue) => {
        if (acc[currentValue] === undefined) acc[currentValue] = {};
        return acc[currentValue];
    }, context);
    pointer[key] = value;
    return context;
}
function groupByValueDeep(array, propertyPath, groupFieldName, groupDataFieldName) {
    var obj1;
    var obj2 = {};
    return array.reduce(function (acc, currentValue) {
        var key = getValueDeep(currentValue, propertyPath);
        if (!obj2[key]) {
            obj1 = {};
            obj1[groupFieldName] = key;
            obj1[groupDataFieldName] = [];
            acc.push(obj1);
            obj2[key] = obj1;
        } else {
            obj1 = obj2[key];
        }
        obj1[groupDataFieldName].push(currentValue);
        return acc;
    }, []);
}
Array.prototype.equalsDeep = function (array) {
    if (!array)
        return false;
    if (this.length != array.length)
        return false;
    for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equalsDeep(array[i]))
                return false;
        } else if (this[i] != array[i]) {
            return false;
        }
    }
    return true;
}


// App //////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
var app = angular.module("sfdmuGuiApp", ["ui.router", "ui.router.state.events", "ngAnimate", "ngSanitize", "ui.bootstrap", "angucomplete"]);


// Routes //////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
app.config(['$stateProvider', "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: './views/login.html'
    }).state('register', {
        url: '/register',
        templateUrl: './views/register.html'
    }).state('home', {
        url: '/home',
        templateUrl: './views/home.html'
    }).state('config', {
        url: '/config',
        templateUrl: './views/config.html'
    }).state('preview', {
        url: '/preview',
        templateUrl: './views/preview.html'
    }).state('execute', {
        url: '/execute',
        templateUrl: './views/execute.html'
    }).state('profile', {
        url: '/profile',
        templateUrl: './views/profile.html'
    });
    $urlRouterProvider.otherwise('/home');
}]);


// Directives ///////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
app.directive('transferPicker', function ($timeout, $compile, $rootScope) {
    return {
        link: function ($scope, $element, $attrs) {

            var oldtemsCount = 0;

            var ngModel = $element.attr('data-model');
            var ngCollection = $element.attr('data-collection');

            var groupBy = $element.attr("group-by");
            var groupItemName = "category";
            var groupArrayName = "categoryData";
            var dataErrorName = "errorMessage";
            var onItemChanged = $element.attr('on-item-changed');

            if (!$element.attr("data-transfer-picker")) {

                $element.attr("data-transfer-picker", "true");
                var id = $scope.$eval($element.attr("data-id"));

                var itemName = $element.attr("item-name");
                var valueName = $element.attr("value-name");

                var leftTabNameText = $scope.$eval($element.attr("left-tab-name-text"));
                var rightTabNameText = $scope.$eval($element.attr("right-tab-name-text"));
                var searchPlaceholderText = $scope.$eval($element.attr("search-placeholder-text"));

                var settings = {
                    groupDataArray: [],
                    groupItemName,
                    groupArrayName,
                    itemName,
                    valueName,
                    leftTabNameText,
                    rightTabNameText,
                    searchPlaceholderText,
                    dataErrorName
                };
            }
            $scope.$watch(ngModel, function (old, $new, $scope) {
                var items = getValueDeep($scope, ngCollection) || [];
                oldtemsCount = items.length;
                if (items.length == 0) return;
                var selectedItems = getValueDeep($scope, ngModel) || [];
                items.forEach(function (item) {
                    var it = selectedItems.filter(function (selectedItem) {
                        return selectedItem[valueName] == item[valueName];
                    });
                    item.selected = it.length > 0;
                });
                settings.groupDataArray = groupByValueDeep(items, groupBy, groupItemName, groupArrayName);
                $("#" + id).empty();
                $("#" + id).transfer(settings);
            }, true);
            $scope.$watch(ngCollection, function (old, $new, $scope) {
                oldtemsCount = 0;
                var items = getValueDeep($scope, ngCollection) || [];
                if (items.length == 0) return;
                settings.groupDataArray = groupByValueDeep(items, groupBy, groupItemName, groupArrayName);
                settings.callable = function (items) {
                    $timeout(function () {
                        var i = [].concat(items);
                        setValueDeep($scope, ngModel, i);
                        if (onItemChanged) {
                            if (oldtemsCount != i.length) {
                                oldtemsCount = i.length;
                                var fn = getValueDeep($scope, onItemChanged);
                                if (fn) {
                                    fn($scope, items, $element);
                                }
                            }
                        }
                    });
                }
                $("#" + id).empty();
                $("#" + id).transfer(settings);
            }, true);

        },
        restrict: "EA"
    }
});

app.directive('selectPicker', function ($timeout) {
    return {
        link: function ($scope, $element) {

            var ngModel = $element.attr('data-model');
            //var ngCollection = $element.attr('data-collection');
            var onItemChanged = $element.attr('on-item-changed');

            if (!$element.attr("data-select-picker")) {
                $element.attr("data-select-picker", "true");
                $element.attr("multiple", "true");
                $element.attr('data-live-search', 'true');
                $element.attr('data-selected-text-format', 'count > 3');
                $element.attr('data-live-search-placeholder', "Search...");
                var modelValue = getValueDeep($scope, ngModel) || [];
                $element.prop('old-value', modelValue);

                if ($element.attr("data-multiple") == "true") {
                    $element.attr("data-actions-box", "true");
                } else {
                    $element.attr("data-max-options", "1");
                }
                $element.on('changed.bs.select', function (e) {
                    $scope.$apply(function () {
                        var val = [];
                        for (opt of e.target.selectedOptions) {
                            val.push(opt.value);
                        }
                        val = [].concat(val);
                        setValueDeep($scope, ngModel, val);
                        var oldValue = $element.prop('old-value');
                        oldValue = [].concat(oldValue);
                        if (onItemChanged && !oldValue.equalsDeep(val)) {
                            var fn = getValueDeep($scope, onItemChanged);
                            if (fn) {
                                fn(val, oldValue, $scope, $element);
                            }
                            $element.prop('old-value', val);
                        }
                    });
                });
            }
            $scope.$watch(ngModel, function (old, $new, $scope) {
                $timeout(function () {
                    var modelValue = getValueDeep($scope, ngModel);
                    $element.selectpicker('val', modelValue);
                });
            }, true);
        },
        restrict: "EA"
    }
});

app.directive('uibSwitch', function () {
    return {
        link: function (scope, element, attrs) {
            scope.$watch('model', () => {
                scope.show = typeof scope.show == 'undefined' ? true : scope.show;
                angular.element(element).removeAttr('id').removeAttr('title');
            });
        },
        transclude: true,
        replace: true,
        scope: {
            model: '=ngModel',
            class: '@',
            id: '@',
            change: '&ngChange',
            click: '&ngClick',
            title: '@',
            show: '=ngShow',
            help: '@'
        },
        templateUrl: './javascripts/common/angular_templates/switch.html',
        restrict: "EA"
    }
});

app.directive('uibBtnSwitch', function () {
    return {
        link: function (scope, element, attrs) {
            scope.$watch('model', () => {
                scope.show = typeof scope.show == 'undefined' ? true : scope.show;
                scope.valueTrue = typeof scope.valueTrue == 'undefined' ? true : scope.valueTrue;
                scope.valueFalse = typeof scope.valueFalse == 'undefined' ? false : scope.valueFalse;
            });
        },
        replace: true,
        scope: {
            model: '=ngModel',
            class: '@',
            id: '@',
            change: '&ngChange',
            show: '=ngShow',
            label: '@',
            labelTrue: '@',
            labelFalse: '@',
            valueTrue: '@',
            valueFalse: '@',
            help: '@'
        },
        templateUrl: './javascripts/common/angular_templates/btn-switch.html',
        restrict: "EA"
    }
});

app.directive('uibLabel', function () {
    return {
        link: function (scope, element, attrs) {
        },
        transclude: true,
        replace: true,
        scope: {
            class: '@',
            help: '@',
            for: '@'
        },
        templateUrl: './javascripts/common/angular_templates/label.html',
        restrict: "EA"
    }
});


app.directive('uibSpan', function () {
    return {
        link: function (scope, element, attrs) {
        },
        transclude: true,
        replace: true,
        scope: {
            class: '@',
            help: '@',
            ngClick: '&ngClick'
        },
        templateUrl: './javascripts/common/angular_templates/span.html',
        restrict: "EA"
    }
});


app.directive('uibBtnIcon', function () {
    return {
        link: function (scope, element, attrs) {
            scope.variant = typeof scope.variant == 'undefined' ? 'primary' : scope.variant;
            scope.size = typeof scope.size == 'undefined' ? 'sm' : scope.size;
            scope.icon = typeof scope.icon == 'undefined' ? 'check' : scope.icon;
        },
        transclude: true,
        scope: {
            variant: '@',
            size: '@',
            class: '@',
            help: '@',
            icon: '@',
            ngClick: '&ngClick'
        },
        templateUrl: './javascripts/common/angular_templates/btn-icon.html',
        restrict: "EA"
    }
});


// Providers ///////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
app.provider('$copyToClipboard', [function () {

    this.$get = ['$q', '$window', function ($q, $window) {
        var body = angular.element($window.document.body);
        var textarea = angular.element('<textarea/>');
        textarea.css({
            position: 'fixed',
            opacity: '0'
        });
        return {
            copy: function (stringToCopy) {
                var deferred = $q.defer();
                deferred.notify("copying the text to clipboard");
                textarea.val(stringToCopy);
                body.append(textarea);
                textarea[0].select();

                try {
                    var successful = $window.document.execCommand('copy');
                    if (!successful) throw successful;
                    deferred.resolve(successful);
                } catch (err) {
                    deferred.reject(err);
                } finally {
                    textarea.remove();
                }
                return deferred.promise;
            }
        };
    }];
}]);


// Controller ///////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
app.controller("appController", [
    '$copyToClipboard',
    '$scope',
    '$rootScope',
    '$http',
    '$timeout',
    '$window',
    '$q',
    '$state',
    '$sce',
    function (
        $copyToClipboard,
        $scope,
        $rootScope,
        $http,
        $timeout,
        $window,
        $q,
        $state,
        $sce) {

        var controller = new Controller({
            $copyToClipboard,
            $scope,
            $rootScope,
            $http,
            $timeout,
            $window,
            $q,
            $state,
            $sce
        });
        $scope.init = controller.init.bind(controller);
    }
]);




