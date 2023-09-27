import angular from "angular";
import { CONSTANTS } from "../../../common";

export class AppController implements angular.IComponentController {

    // Togger buttons ----------------------------------------------------------
    public leftButtonSymbol = '<';
    public rightButtonSymbol = '<';

    toggleLeft() {
        const sidebar: HTMLElement = document.querySelector('.app-sidebar.left');
        if (sidebar.clientWidth === 0) {
            sidebar.style.width = CONSTANTS.LEFT_SIDEBAR_WIDTH;
            this.leftButtonSymbol = '<';
        } else {
            sidebar.style.width = "0";
            this.leftButtonSymbol = '>';
        }
    }

    toggleRight() {
        const sidebar: HTMLElement = document.querySelector('.app-sidebar.right');
        if (sidebar.clientWidth === 0) {
            sidebar.style.width = CONSTANTS.RIGHT_SIDEBAR_WIDTH;
            this.rightButtonSymbol = '>';
        } else {
            sidebar.style.width = "0";
            this.rightButtonSymbol = '<';
        }
    }

    $onInit() {        
        const sidebar: HTMLElement = document.querySelector('.app-sidebar.left');
        sidebar.style.width = CONSTANTS.LEFT_SIDEBAR_WIDTH;
    }
}
