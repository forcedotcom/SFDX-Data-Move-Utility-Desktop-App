import angular from "angular";
import { CONSTANTS } from "../../../common";
import { BroadcastService, TranslationService } from "../../../services";


/**
 * Service for handling spinner-related operations.
 */
export interface ISpinnerService {
    /**
     * Displays the spinner with the provided message.
     * @param message - The message to display alongside the spinner.
     */
    showSpinner: (message?: string) => void;

    /**
     * Hides the spinner if it is currently being displayed.
     */
    hideSpinner: () => void;

    /**
     * Checks whether the spinner is currently visible or not.
     * @returns `true` if the spinner is visible, otherwise `false`.
     */
    isSpinnerVisible: () => boolean;
}


/**
 * Service for handling spinner-related operations.
 */
class SpinnerService implements ISpinnerService {

    static $inject = ['$compile', '$document', '$rootScope', '$timeout', '$translate', '$broadcast'];

    private startTime: number;
    private delayThreshold = CONSTANTS.LONG_OPERATION_MESSAGE_THRESHOLD;
    private timerPromise: ng.IPromise<void>;
    private $scope: angular.IScope;

    constructor(private $compile: angular.ICompileService, private $document: angular.IDocumentService,
        private $rootScope: angular.IRootScopeService, private $timeout: angular.ITimeoutService, private $translate: TranslationService,
        private $broadcast: BroadcastService) { }

    public showSpinner(message?: string): void {
        message ||= this.$translate.translate({ key: 'LOADING' });
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
        } else {
            this.displaySpinner(message);
        }
        this.startTime = Date.now();
        this.timerPromise = this.$timeout(() => {
            if (this.isDelayExceeded()) {
                this.displayLongTimeOperationMessage();
            }
        }, this.delayThreshold);
    }

    public hideSpinner(): void {
        this.$timeout.cancel(this.timerPromise);
        this.timerPromise = null;
        this.hideElement();
        if (this.$scope) {
            this.$scope.$destroy();
            this.$scope = null;
        }
    }

    public isSpinnerVisible(): boolean {
        return !!angular.element('.spinner').length;
    }


    /* #region Private Members */
    private isDelayExceeded(): boolean {
        const currentTime = Date.now();
        const deltaMs = currentTime - this.startTime;
        return deltaMs > this.delayThreshold;
    }

    private displaySpinner(message: string): void {
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
        angular.element(this.$document[0].body).append(this.$compile(template)(this.$scope));
    }

    private displayLongTimeOperationMessage(): void {
        const template = `
            <div id="long-operation-message" class="modal-body text-center">
                <p>{{ 'LONG_WAIT' | translate }}</p>
                <button class="btn btn-danger" ng-click="handleExit()">{{ 'EXIT' | translate }}</button>
            </div>`;
        angular.element('.spinner .modal-content').append(this.$compile(template)(this.$scope));
    }

    private hideLongTimeOperationMessage(): void {
        angular.element('.spinner #long-operation-message').remove();
    }

    private updateSpinnerMessage(message: string): void {
        const spinnerMessageElement = this.$document[0].querySelector('#spinner-message');
        if (spinnerMessageElement) {
            spinnerMessageElement.textContent = message;
        }
    }

    private hideElement(): void {
        angular.element('.spinner').remove();
    }
    /* #endregion */
}

export const SpinnerServiceModule = angular.module('spinnerServiceModule', [])
    .service('$spinner', SpinnerService);


