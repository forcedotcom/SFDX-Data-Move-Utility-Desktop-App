import angular from 'angular';
import { ScriptAddOnsController } from './scriptAddOns.controller';

export class ScriptAddOnsComponent implements angular.IComponentOptions {
    public controller = ScriptAddOnsController;
    public templateUrl = './js/angular-app/components/scriptAddOns/scriptAddOns.html';
    public bindings = {
        // Define your component bindings here
    };
}