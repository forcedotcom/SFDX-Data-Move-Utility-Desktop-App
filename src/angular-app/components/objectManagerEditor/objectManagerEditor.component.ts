import angular from 'angular';
import { ObjectManagerEditorController } from './objectManagerEditor.controller';

export class ObjectManagerEditorComponent implements angular.IComponentOptions {
    public controller = ObjectManagerEditorController;
    public templateUrl = './js/angular-app/components/objectManagerEditor/objectManagerEditor.html';
    public bindings = {
        // Define your component bindings here
    };
}
