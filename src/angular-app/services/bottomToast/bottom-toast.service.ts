import angular from "angular";
import { CONSTANTS } from "../../../common";

/**
 * Represents the bottom toast service interface for displaying toast messages at the bottom of the screen.
 */
export interface IBottomToastService {
    /**
     * Shows a toast message at the bottom of the screen.
     * @param message - The message to display in the toast.
     */
    showToast(message: string): void;

    /**
     * Hides the currently displayed toast message, if any.
     */
    hideToast(): void;
}


/**
 * Represents the bottom toast service for displaying toast messages at the bottom of the screen.
 */
export class BottomToastService implements IBottomToastService {

    static $inject = ['$timeout', '$compile', '$rootScope'];
    
    private toastElement: angular.IAugmentedJQuery;

    constructor(
        private $timeout: angular.ITimeoutService,
        private $compile: angular.ICompileService,
        private $rootScope: angular.IRootScopeService
    ) { }

    showToast(message: string): void {
        // First hide any existing toast
        this.hideToast();

        const toastTemplate = angular.element(`
            <div id="bottom-toast" 
                    class="position-fixed bottom-0 start-0 p-3 w-100 bg-warning text-white" 
                    style="height: 0; transition: height ${CONSTANTS.BOTTOM_TOAST_ANIMATION_DURATION / 1000}s; overflow: hidden;">
                <div class="d-flex">
                    <i class="fas fa-exclamation-triangle fa-lg mt-2"></i>
                    <div class="ms-2">${message}</div>
                </div>
            </div>
        `);

        this.toastElement = this.$compile(toastTemplate)(this.$rootScope);
        angular.element(document.body).append(this.toastElement);

        // Display the toast
        this.$timeout(() => {
            this.toastElement.css('height', '80px');
        }, 0);
    }

    hideToast(): void {
        if (this.toastElement) {
            this.toastElement.css('height', '0px');

            this.$timeout(() => {
                this.toastElement.remove();
                this.toastElement = null;
            }, CONSTANTS.BOTTOM_TOAST_ANIMATION_DURATION); // Match this delay with the CSS transition duration
        }
    }
}

export const bottomToastServiceModule = angular.module('bottomToastServiceModule', [])
    .service('$bottomToast', BottomToastService);
