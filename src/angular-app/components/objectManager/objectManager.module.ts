import angular from 'angular';
import { ObjectManagerComponent } from './objectManager.component';

export const ObjectManagerComponentModule = angular.module('objectManagerComponentModule', [])
    .component('objectManager', new ObjectManagerComponent());
