import angular from 'angular';
import { ScriptAddOnsComponent } from './scriptAddOns.component';

export const ScriptAddOnsComponentModule = angular.module('scriptAddOnsComponentModule', [])
    .component('mainScriptAddOns', new ScriptAddOnsComponent());
