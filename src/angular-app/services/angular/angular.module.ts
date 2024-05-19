
import angular from 'angular';
import { AngularService } from './angular.service';

export const angularServiceModule = angular.module('angularServiceModule', [])
	.service('$angular', ['$compile', AngularService]);