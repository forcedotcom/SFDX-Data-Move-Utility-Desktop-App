
import angular from 'angular';
import { ObjectManagerToolbarController } from './objectManagerToolbar.controller';

export class ObjectManagerToolbarComponent implements angular.IComponentOptions {
	public controller = ObjectManagerToolbarController;
	public templateUrl = './js/angular-app/components/objectManagerToolbar/objectManagerToolbar.html';
	public bindings = {};
}