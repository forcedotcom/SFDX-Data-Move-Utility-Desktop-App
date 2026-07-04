/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */

import angular from 'angular';
import { TranslationFilter, AngularTranslationService } from '.';


export const AngularTranslationServiceModule = angular.module('translationServiceModule', [])
	.service('$translate', function () { return new AngularTranslationService() })
	.filter('translate', ['$translate', function ($translate: AngularTranslationService) {
		return function (input: string, args: { [key: string]: string; }, lang: string) {
			return new TranslationFilter($translate).filter(input, args, lang);
		};
	}]);