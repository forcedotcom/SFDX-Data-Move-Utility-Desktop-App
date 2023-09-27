"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectManagerComponent = void 0;
const objectManager_controller_1 = require("./objectManager.controller");
class ObjectManagerComponent {
    constructor() {
        this.controller = objectManager_controller_1.ObjectManagerController;
        this.templateUrl = './js/angular-app/components/objectManager/objectManager.html';
        this.bindings = {};
    }
}
exports.ObjectManagerComponent = ObjectManagerComponent;
//# sourceMappingURL=objectManager.component.js.map