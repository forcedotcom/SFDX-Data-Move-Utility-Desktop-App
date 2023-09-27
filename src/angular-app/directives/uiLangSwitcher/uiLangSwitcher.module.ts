
import angular from 'angular';
import { UiLangSwitcherDirective } from '.';

export const UiLangSwitcherModule = angular.module('uiLangSwitcherDirectiveModule', [])
	.directive('uiLangSwitcher', UiLangSwitcherDirective);