
import angular from 'angular';
import { UiTransferPickerDirective } from '.';

export const UiTransferPickerModule = angular.module('uiTransferPickerDirectiveModule', [])
	.directive('uiTransferPicker',
		['$translate', '$timeout', ($translate, $timeout) => new UiTransferPickerDirective($translate, $timeout)]
	);