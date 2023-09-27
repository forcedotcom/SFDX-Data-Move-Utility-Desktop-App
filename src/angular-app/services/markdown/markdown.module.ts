
import angular from 'angular';
import { AngularMarkdownService } from '.';


export const AngularMarkdownServiceModule = angular.module('markdownServiceModule', [])
    .service('$md', function () { return new AngularMarkdownService(); })
    .filter('md', ['$sce', '$md', function ($sce: ng.ISCEService, $md: AngularMarkdownService) {
        return function (input: string) {
            return $sce.trustAsHtml($md.render(input));
        };
    }]);