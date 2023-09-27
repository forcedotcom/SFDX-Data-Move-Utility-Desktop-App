
import angular from 'angular';
import { ObjectManagerToolbarComponent } from './objectManagerToolbar.component';

export const ObjectManagerToolbarComponentModule = angular.module('objectManagerToolbarComponentModule', [])
	.component('objectManagerToolbar', new ObjectManagerToolbarComponent()); 