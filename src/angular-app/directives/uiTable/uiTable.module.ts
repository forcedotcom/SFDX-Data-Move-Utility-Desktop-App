import angular from 'angular';
import { uiTable } from '.';

export const uiTableDirectiveModule = angular.module('uiTableDirectiveModule', [])
    .directive('uiTable', uiTable);
