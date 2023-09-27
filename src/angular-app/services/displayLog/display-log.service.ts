
import angular from "angular";
/**
 * Service for displaying log messages in the application.
 */
export interface IDisplayLogService {
    /**
     * Initializes the service with a parent selector and maximum view height.
     * @param parentSelector - The selector to which the log view will be appended.
     * @param maxViewHeight - Maximum height of the log view.
     */
    initialize(parentSelector: string, maxViewHeight: string): void;

    /**
     * Adds a row of text to the log view.
     * @param rowText - Text to be added as a new row.
     * @param type - Type of row to be added.
     */
    addRow(rowText: string, type: 'log' | 'warn' | 'error'): void;

    /**
     * Clears all rows from the log view.
     */
    clear(): void;
}

/**
 * Service for displaying log messages in the application.
 */
class DisplayLogService implements IDisplayLogService {
    private logContainer: HTMLElement | null = null;
    private logRowsDiv: HTMLElement | null = null;
    private logScope: any;

    constructor(private $rootScope: any, private $compile: any) { }

    public initialize(parentSelector: string, maxViewHeight: string): void {
        this.logScope = this.$rootScope.$new(true);

        const template = `
            <div style="position: relative;" id="logContainer">
                <button tooltip="{{ 'SCROLL_TOP' | translate }}" class="btn btn-outline-primary btn-circle" style="position: absolute; top: 0; left: 0;" ng-click="scrollToTop()">˄</button>
                <button tooltip="{{ 'SCROLL_BOTTOM' | translate }}" class="btn btn-outline-primary btn-circle" style="position: absolute; top: 40px; left: 0;" ng-click="scrollToBottom()">˅</button>
                <div id="logRows" style="position: relative; top: 100px; max-height: ${maxViewHeight}; overflow-y: auto; overflow-x:hidden"></div>
            </div>
        `;

        this.logScope.scrollToTop = () => {
            if (this.logRowsDiv) this.logRowsDiv.scrollTop = 0;
        };

        this.logScope.scrollToBottom = () => {
            if (this.logRowsDiv) this.logRowsDiv.scrollTop = this.logRowsDiv.scrollHeight;
        };

        const compiledTemplate = this.$compile(template)(this.logScope);
        const parentElement = document.querySelector(parentSelector);
        if (parentElement) {
            parentElement.appendChild(compiledTemplate[0]);
        }

        this.logContainer = parentElement.querySelector(`#logContainer`);
        this.logRowsDiv = parentElement.querySelector(`#logRows`);
    }

    public addRow(rowText: string, type: 'log' | 'warn' | 'error' = 'log'): void {
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
            logRow.innerHTML =`<b class="text-xl">⇨</b> ${rowText}`;
            this.logRowsDiv.appendChild(logRow);
            this.logScope.scrollToBottom();
        }
    }

    public clear(): void {
        if (this.logRowsDiv) {
            this.logRowsDiv.innerHTML = '';
        }
    }
}

/**
 * @module DisplayLogServiceModule
 */
export const DisplayLogServiceModule = angular.module('displayLogServiceModule', [])
    .service('$displayLog', DisplayLogService);


