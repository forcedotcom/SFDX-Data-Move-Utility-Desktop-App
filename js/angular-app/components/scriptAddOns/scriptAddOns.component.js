"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptAddOnsComponent = void 0;
const scriptAddOns_controller_1 = require("./scriptAddOns.controller");
class ScriptAddOnsComponent {
    constructor() {
        this.controller = scriptAddOns_controller_1.ScriptAddOnsController;
        this.templateUrl = './js/angular-app/components/scriptAddOns/scriptAddOns.html';
        this.bindings = {
        // Define your component bindings here
        };
    }
}
exports.ScriptAddOnsComponent = ScriptAddOnsComponent;
//# sourceMappingURL=scriptAddOns.component.js.map