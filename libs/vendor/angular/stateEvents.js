"use strict";
// var angular = require('angular');
(function() {
    var isFunction = angular.isFunction,
        isString = angular.isString;

    function applyPairs(memo, keyValTuple) {
        var key, value;
        if (Array.isArray(keyValTuple))
            key = keyValTuple[0], value = keyValTuple[1];
        if (!isString(key))
            throw new Error("invalid parameters to applyPairs");
        memo[key] = value;
        return memo;
    }

    function stateChangeStartHandler($transition$) {
        if (!$transition$.options().notify || !$transition$.valid() || $transition$.ignored())
            return;
        var $injector = $transition$.injector();
        var $stateEvents = $injector.get('$stateEvents');
        var $rootScope = $injector.get('$rootScope');
        var $state = $injector.get('$state');
        var $urlRouter = $injector.get('$urlRouter');
        var enabledEvents = $stateEvents.provider.enabled();
        var toParams = $transition$.params("to");
        var fromParams = $transition$.params("from");
        if (enabledEvents.$stateChangeSuccess) {
            var startEvent = $rootScope.$broadcast('$stateChangeStart', $transition$.to(), toParams, $transition$.from(), fromParams, $transition$.options(), $transition$);
            if (startEvent.defaultPrevented) {
                if (enabledEvents.$stateChangeCancel) {
                    $rootScope.$broadcast('$stateChangeCancel', $transition$.to(), toParams, $transition$.from(), fromParams, $transition$.options(), $transition$);
                }
                //Don't update and resync url if there's been a new transition started. see issue #2238, #600
                if ($state.transition == null)
                    $urlRouter.update();
                return false;
            }
            $transition$.promise.then(function() {
                $rootScope.$broadcast('$stateChangeSuccess', $transition$.to(), toParams, $transition$.from(), fromParams, $transition$.options(), $transition$);
            });
        }
        if (enabledEvents.$stateChangeError) {
            $transition$.promise["catch"](function(error) {
                if (error && (error.type === 2 /* RejectType.SUPERSEDED */ || error.type === 3 /* RejectType.ABORTED */ ))
                    return;
                var evt = $rootScope.$broadcast('$stateChangeError', $transition$.to(), toParams, $transition$.from(), fromParams, error, $transition$.options(), $transition$);
                if (!evt.defaultPrevented) {
                    $urlRouter.update();
                }
            });
        }
    }
    stateNotFoundHandler.$inject = ['$to$', '$from$', '$state', '$rootScope', '$urlRouter'];

    function stateNotFoundHandler($to$, $from$, injector) {
        var $state = injector.get('$state');
        var $rootScope = injector.get('$rootScope');
        var $urlRouter = injector.get('$urlRouter');
        var redirect = { to: $to$.identifier(), toParams: $to$.params(), options: $to$.options() };
        var e = $rootScope.$broadcast('$stateNotFound', redirect, $from$.state(), $from$.params());
        if (e.defaultPrevented || e.retry)
            $urlRouter.update();

        function redirectFn() {
            return $state.target(redirect.to, redirect.toParams, redirect.options);
        }
        if (e.defaultPrevented) {
            return false;
        } else if (e.retry || !!$state.get(redirect.to)) {
            return e.retry && isFunction(e.retry.then) ? e.retry.then(redirectFn) : redirectFn();
        }
    }
    $StateEventsProvider.$inject = ['$stateProvider'];

    function $StateEventsProvider($stateProvider) {
        $StateEventsProvider.prototype.instance = this;
        var runtime = false;
        var allEvents = ['$stateChangeStart', '$stateNotFound', '$stateChangeSuccess', '$stateChangeError'];
        var enabledStateEvents = allEvents.map(function(e) { return [e, true]; }).reduce(applyPairs, {});

        function assertNotRuntime() {
            if (runtime)
                throw new Error("Cannot enable events at runtime (use $stateEventsProvider");
        }
        /**
         * Enables the deprecated UI-Router 0.2.x State Events
         * [ '$stateChangeStart', '$stateNotFound', '$stateChangeSuccess', '$stateChangeError' ]
         */
        this.enable = function() {
            var events = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                events[_i - 0] = arguments[_i];
            }
            assertNotRuntime();
            if (!events || !events.length)
                events = allEvents;
            events.forEach(function(event) { return enabledStateEvents[event] = true; });
        };
        /**
         * Disables the deprecated UI-Router 0.2.x State Events
         * [ '$stateChangeStart', '$stateNotFound', '$stateChangeSuccess', '$stateChangeError' ]
         */
        this.disable = function() {
            var events = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                events[_i - 0] = arguments[_i];
            }
            assertNotRuntime();
            if (!events || !events.length)
                events = allEvents;
            events.forEach(function(event) { return delete enabledStateEvents[event]; });
        };
        this.enabled = function() { return enabledStateEvents; };
        this.$get = $get;
        $get.$inject = ['$transitions'];

        function $get($transitions) {
            runtime = true;
            if (enabledStateEvents["$stateNotFound"])
                $stateProvider.onInvalid(stateNotFoundHandler);
            if (enabledStateEvents.$stateChangeStart)
                $transitions.onBefore({}, stateChangeStartHandler, { priority: 1000 });
            return {
                provider: $StateEventsProvider.prototype.instance
            };
        }
    }
    angular.module('ui.router.state.events', ['ui.router.state'])
        .provider("$stateEvents", $StateEventsProvider)
        .run(['$stateEvents', function($stateEvents) {}]);
})();