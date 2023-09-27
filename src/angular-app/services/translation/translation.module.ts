
import angular from 'angular';
import { TranslationFilter, AngularTranslationService } from '.';


export const AngularTranslationServiceModule = angular.module('translationServiceModule', [])
	.service('$translate', function () { return new AngularTranslationService() })
	.filter('translate', ['$translate', function ($translate: AngularTranslationService) {
		return function (input: string, args: { [key: string]: string; }, lang: string) {
			return new TranslationFilter($translate).filter(input, args, lang);
		};
	}]);