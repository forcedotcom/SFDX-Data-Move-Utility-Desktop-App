"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectManagerToolbarComponent = void 0;
const objectManagerToolbar_controller_1 = require("./objectManagerToolbar.controller");
class ObjectManagerToolbarComponent {
    constructor() {
        this.controller = objectManagerToolbar_controller_1.ObjectManagerToolbarController;
        this.templateUrl = './js/angular-app/components/objectManagerToolbar/objectManagerToolbar.html';
        this.bindings = {};
    }
}
exports.ObjectManagerToolbarComponent = ObjectManagerToolbarComponent;
//# sourceMappingURL=objectManagerToolbar.component.js.map