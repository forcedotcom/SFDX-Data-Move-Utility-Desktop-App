import angular from 'angular';
import { ObjectManagerEditorComponent } from './objectManagerEditor.component';

export const ObjectManagerEditorComponentModule = angular.module('objectManagerEditorComponentModule', [])
    .component('objectManagerEditor', new ObjectManagerEditorComponent());
