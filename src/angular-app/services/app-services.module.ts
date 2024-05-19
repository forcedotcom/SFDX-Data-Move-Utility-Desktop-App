import angular from 'angular';

export const AppServicesModule = angular.module('appServicesModule', [

	'appServiceModule',
	'broadcastServiceModule',
	'markdownServiceModule',
	'translationServiceModule',
	'dialogEditServiceModule',
	'spinnerServiceModule',
	'bottomToastServiceModule',
	'displayLogServiceModule',
	'jsonEditModalServiceModule',
	'angularServiceModule'

]);