"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayLogServiceModule = void 0;
const angular_1 = __importDefault(require("angular"));
/**
 * Service for displaying log messages in the application.
 */
class DisplayLogService {
    constructor($rootScope, $compile) {
        this.$rootScope = $rootScope;
        this.$compile = $compile;
        this.logContainer = null;
        this.logRowsDiv = null;
    }
    initialize(parentSelector, maxViewHeight) {
        this.logScope = this.$rootScope.$new(true);
        const template = `
            <div style="position: relative;" id="logContainer">
                <button tooltip="{{ 'SCROLL_TOP' | translate }}" class="btn btn-outline-primary btn-circle" style="position: absolute; top: 0; left: 0;" ng-click="scrollToTop()">˄</button>
                <button tooltip="{{ 'SCROLL_BOTTOM' | translate }}" class="btn btn-outline-primary btn-circle" style="position: absolute; top: 40px; left: 0;" ng-click="scrollToBottom()">˅</button>
                <div id="logRows" style="position: relative; top: 100px; max-height: ${maxViewHeight}; overflow-y: auto; overflow-x:hidden"></div>
            </div>
        `;
        this.logScope.scrollToTop = () => {
            if (this.logRowsDiv)
                this.logRowsDiv.scrollTop = 0;
        };
        this.logScope.scrollToBottom = () => {
            if (this.logRowsDiv)
                this.logRowsDiv.scrollTop = this.logRowsDiv.scrollHeight;
        };
        const compiledTemplate = this.$compile(template)(this.logScope);
        const parentElement = document.querySelector(parentSelector);
        if (parentElement) {
            parentElement.appendChild(compiledTemplate[0]);
        }
        this.logContainer = parentElement.querySelector(`#logContainer`);
        this.logRowsDiv = parentElement.querySelector(`#logRows`);
    }
    addRow(rowText, type = 'log') {
        if (this.logRowsDiv) {
            const logRow = document.createElement('div');
            logRow.classList.add('pb-3');
            switch (type) {
                case 'log':
                    logRow.classList.add('text-info');
                    break;
                case 'warn':
                    logRow.classList.add('text-warning');
                    break;
                case 'error':
                    logRow.classList.add('text-danger');
                    break;
            }
            logRow.innerHTML = `<b class="text-xl">⇨</b> ${rowText}`;
            this.logRowsDiv.appendChild(logRow);
            this.logScope.scrollToBottom();
        }
    }
    clear() {
        if (this.logRowsDiv) {
            this.logRowsDiv.innerHTML = '';
        }
    }
}
/**
 * @module DisplayLogServiceModule
 */
exports.DisplayLogServiceModule = angular_1.default.module('displayLogServiceModule', [])
    .service('$displayLog', DisplayLogService);
//# sourceMappingURL=display-log.service.js.map