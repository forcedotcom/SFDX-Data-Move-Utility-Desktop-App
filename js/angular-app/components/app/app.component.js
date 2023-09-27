"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppComponent = void 0;
const _1 = require(".");
class AppComponent {
    constructor() {
        this.controller = _1.AppController;
        this.templateUrl = './js/angular-app/components/app/app.html';
        this.transclude = {
            header: '?headerPane',
            toolbar: '?toolbarPane',
            body: '?bodyPane',
            footer: '?footerPane',
            leftSidebar: '?leftSidebarPane',
            rightSidebar: '?rightSidebarPane'
        };
    }
}
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map