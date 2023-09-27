import angular from 'angular';
import { AppComponent } from '.';

export const AppComponentModule = angular.module('appComponentModule', [])
	.component('appComponent', new AppComponent());
