
import angular from 'angular';
import { JsonEditModalService } from './jsonEditModalService.service';

export const JsonEditModalServiceModule = angular.module('jsonEditModalServiceModule', [])
	.service('$jsonEditModal', JsonEditModalService);