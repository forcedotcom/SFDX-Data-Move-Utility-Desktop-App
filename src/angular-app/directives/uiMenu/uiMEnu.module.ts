import angular from 'angular';
import { uiMenuDirective } from '.';

export const uiMenuDirectiveModule = angular.module('uiMenuDirectiveModule', [])
    .directive('uiMenu', ['$compile', '$app', uiMenuDirective]);