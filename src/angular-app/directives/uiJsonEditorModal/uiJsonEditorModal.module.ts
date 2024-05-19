
import angular from 'angular';
import { UiJsonEditorModalDirective } from './uiJsonEditorModal.directive';

export const UiJsonEditorModalModule = angular.module('uiJsonEditorDirectiveModalModule', [])
	.directive('uiJsonEditorModal', ['$jsonEditModal', '$translate', '$angular', '$timeout',
		($jsonEditModal, $translate, $angular, $timeout) => UiJsonEditorModalDirective($jsonEditModal, $translate, $angular, $timeout)]);