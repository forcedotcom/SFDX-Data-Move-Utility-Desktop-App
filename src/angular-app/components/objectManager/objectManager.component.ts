import angular from 'angular';
import { ObjectManagerController } from './objectManager.controller';

export class ObjectManagerComponent implements angular.IComponentOptions {
    public controller = ObjectManagerController;
    public templateUrl = './js/angular-app/components/objectManager/objectManager.html';
    public bindings = {};
}
