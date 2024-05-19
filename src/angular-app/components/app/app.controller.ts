import angular from "angular";
import { CONSTANTS } from "../../../common";

export class AppController implements angular.IComponentController {

    public leftButtonSymbol = '❮';
    public rightButtonSymbol = '❮';

    $onInit() {
        const sidebar: HTMLElement = document.querySelector('.app-sidebar.left');
        sidebar.style.width = CONSTANTS.LEFT_SIDEBAR_WIDTH;
    }

    // Event handlers ----------------------------------------------------------
    handleToggleLeftSidebar() {
        const sidebar: HTMLElement = document.querySelector('.app-sidebar.left');
        if (sidebar.clientWidth === 0) {
            sidebar.style.width = CONSTANTS.LEFT_SIDEBAR_WIDTH;
            this.leftButtonSymbol = '❮';
        } else {
            sidebar.style.width = "0";
            this.leftButtonSymbol = '❯';
        }
    }

    handleToggleRightSidebar() {
        const sidebar: HTMLElement = document.querySelector('.app-sidebar.right');
        if (sidebar.clientWidth === 0) {
            sidebar.style.width = CONSTANTS.RIGHT_SIDEBAR_WIDTH;
            this.rightButtonSymbol = '❯';
        } else {
            sidebar.style.width = "0";
            this.rightButtonSymbol = '❮';
        }
    }

}
