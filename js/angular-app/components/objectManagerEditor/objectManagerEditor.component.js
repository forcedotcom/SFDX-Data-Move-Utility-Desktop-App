"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectManagerEditorComponent = void 0;
const objectManagerEditor_controller_1 = require("./objectManagerEditor.controller");
class ObjectManagerEditorComponent {
    constructor() {
        this.controller = objectManagerEditor_controller_1.ObjectManagerEditorController;
        this.templateUrl = './js/angular-app/components/objectManagerEditor/objectManagerEditor.html';
        this.bindings = {
        // Define your component bindings here
        };
    }
}
exports.ObjectManagerEditorComponent = ObjectManagerEditorComponent;
//# sourceMappingURL=objectManagerEditor.component.js.map