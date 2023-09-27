"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinnerServiceModule = void 0;
const angular_1 = __importDefault(require("angular"));
const common_1 = require("../../../common");
/**
 * Service for handling spinner-related operations.
 */
class SpinnerService {
    constructor($compile, $document, $rootScope, $timeout, $translate, $broadcast) {
        this.$compile = $compile;
        this.$document = $document;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.$translate = $translate;
        this.$broadcast = $broadcast;
        this.delayThreshold = common_1.CONSTANTS.LONG_OPERATION_MESSAGE_THRESHOLD;
    }
    showSpinner(message) {
        message || (message = this.$translate.translate({ key: 'LOADING' }));
        if (!this.$scope) {
            this.$scope = this.$rootScope.$new(true);
            this.$scope.handleExit = () => {
                this.$broadcast.broadcastAction('onExit', 'SpinnerService', { action: 'ExitApplication' });
            };
        }
        if (this.timerPromise) {
            this.$timeout.cancel(this.timerPromise);
            this.hideLongTimeOperationMessage();
            this.updateSpinnerMessage(message);
        }
        else {
            this.displaySpinner(message);
        }
        this.startTime = Date.now();
        this.timerPromise = this.$timeout(() => {
            if (this.isDelayExceeded()) {
                this.displayLongTimeOperationMessage();
            }
        }, this.delayThreshold);
    }
    hideSpinner() {
        this.$timeout.cancel(this.timerPromise);
        this.timerPromise = null;
        this.hideElement();
        if (this.$scope) {
            this.$scope.$destroy();
            this.$scope = null;
        }
    }
    isSpinnerVisible() {
        return !!angular_1.default.element('.spinner').length;
    }
    /* #region Private Members */
    isDelayExceeded() {
        const currentTime = Date.now();
        const deltaMs = currentTime - this.startTime;
        return deltaMs > this.delayThreshold;
    }
    displaySpinner(message) {
        const template = `
            <div class="spinner modal-backdrop fade show" style="opacity: 0.5; background-color: #FFFFFF;"></div>
            <div class="spinner modal show d-flex align-items-center justify-content-center" tabindex="-1" style="background: none;">
                <div class="modal-dialog modal-dialog-centered" style="min-width: min(100%, 150px); max-width: min(350px, 100%);">
                    <div class="modal-content border">
                        <div class="modal-body text-center">
                            <div class="spinner-border text-primary mb-3" role="status">
                              <span class="visually-hidden">${message}</span>
                            </div>
                            <div id="spinner-message">${message}</div>
                        </div>
                    </div>
                </div>
            </div>`;
        angular_1.default.element(this.$document[0].body).append(this.$compile(template)(this.$scope));
    }
    displayLongTimeOperationMessage() {
        const template = `
            <div id="long-operation-message" class="modal-body text-center">
                <p>{{ 'LONG_WAIT' | translate }}</p>
                <button class="btn btn-danger" ng-click="handleExit()">{{ 'EXIT' | translate }}</button>
            </div>`;
        angular_1.default.element('.spinner .modal-content').append(this.$compile(template)(this.$scope));
    }
    hideLongTimeOperationMessage() {
        angular_1.default.element('.spinner #long-operation-message').remove();
    }
    updateSpinnerMessage(message) {
        const spinnerMessageElement = this.$document[0].querySelector('#spinner-message');
        if (spinnerMessageElement) {
            spinnerMessageElement.textContent = message;
        }
    }
    hideElement() {
        angular_1.default.element('.spinner').remove();
    }
}
SpinnerService.$inject = ['$compile', '$document', '$rootScope', '$timeout', '$translate', '$broadcast'];
exports.SpinnerServiceModule = angular_1.default.module('spinnerServiceModule', [])
    .service('$spinner', SpinnerService);
//# sourceMappingURL=spinner.service.js.map