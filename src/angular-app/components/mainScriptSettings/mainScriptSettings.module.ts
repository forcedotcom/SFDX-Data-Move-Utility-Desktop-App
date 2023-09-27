import angular from 'angular';
import { MainScriptSettingsComponent } from './mainScriptSettings.component';

export const MainScriptSettingsComponentModule = angular.module('mainScriptSettingsComponentModule', [])
    .component('mainScriptSettings', new MainScriptSettingsComponent());
