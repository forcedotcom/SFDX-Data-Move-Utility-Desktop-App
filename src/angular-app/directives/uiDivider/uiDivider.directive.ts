import angular from 'angular';

class UiDividerDirective implements angular.IDirective {

    restrict = 'E';  // Element directive
    replace = true;
    template = '<div class="vr"></div>';

    static factory(): angular.IDirectiveFactory {
        return () => new UiDividerDirective();
    }
}

export const UiDividerModule = angular.module('uiDividerModule', [])
    .directive('uiDivider', UiDividerDirective.factory());
