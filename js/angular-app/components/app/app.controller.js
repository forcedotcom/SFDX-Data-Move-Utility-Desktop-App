"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("../../../common");
class AppController {
    constructor() {
        this.leftButtonSymbol = '❮';
        this.rightButtonSymbol = '❮';
    }
    $onInit() {
        const sidebar = document.querySelector('.app-sidebar.left');
        sidebar.style.width = common_1.CONSTANTS.LEFT_SIDEBAR_WIDTH;
    }
    // Event handlers ----------------------------------------------------------
    handleToggleLeftSidebar() {
        const sidebar = document.querySelector('.app-sidebar.left');
        if (sidebar.clientWidth === 0) {
            sidebar.style.width = common_1.CONSTANTS.LEFT_SIDEBAR_WIDTH;
            this.leftButtonSymbol = '❮';
        }
        else {
            sidebar.style.width = "0";
            this.leftButtonSymbol = '❯';
        }
    }
    handleToggleRightSidebar() {
        const sidebar = document.querySelector('.app-sidebar.right');
        if (sidebar.clientWidth === 0) {
            sidebar.style.width = common_1.CONSTANTS.RIGHT_SIDEBAR_WIDTH;
            this.rightButtonSymbol = '❯';
        }
        else {
            sidebar.style.width = "0";
            this.rightButtonSymbol = '❮';
        }
    }
}
exports.AppController = AppController;
//# sourceMappingURL=app.controller.js.map