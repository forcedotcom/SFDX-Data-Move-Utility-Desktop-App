"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainScriptSettingsComponent = void 0;
const mainScriptSettings_controller_1 = require("./mainScriptSettings.controller");
class MainScriptSettingsComponent {
    constructor() {
        this.controller = mainScriptSettings_controller_1.MainScriptSettingsController;
        this.templateUrl = './js/angular-app/components/mainScriptSettings/mainScriptSettings.html';
        this.bindings = {
        // Define your component bindings here
        };
    }
}
exports.MainScriptSettingsComponent = MainScriptSettingsComponent;
//# sourceMappingURL=mainScriptSettings.component.js.map