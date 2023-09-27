import angular from 'angular';
import { MainScriptSettingsController } from './mainScriptSettings.controller';

export class MainScriptSettingsComponent implements angular.IComponentOptions {
    public controller = MainScriptSettingsController;
    public templateUrl = './js/angular-app/components/mainScriptSettings/mainScriptSettings.html';
    public bindings = {
        // Define your component bindings here
    };
}
