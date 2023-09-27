"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bottomToastServiceModule = exports.BottomToastService = void 0;
const angular_1 = __importDefault(require("angular"));
const common_1 = require("../../../common");
/**
 * Represents the bottom toast service for displaying toast messages at the bottom of the screen.
 */
class BottomToastService {
    constructor($timeout, $compile, $rootScope) {
        this.$timeout = $timeout;
        this.$compile = $compile;
        this.$rootScope = $rootScope;
    }
    showToast(message) {
        // First hide any existing toast
        this.hideToast();
        const toastTemplate = angular_1.default.element(`
            <div id="bottom-toast" 
                    class="position-fixed bottom-0 start-0 p-3 w-100 bg-warning text-white" 
                    style="height: 0; transition: height ${common_1.CONSTANTS.BOTTOM_TOAST_ANIMATION_DURATION / 1000}s; overflow: hidden;">
                <div class="d-flex">
                    <i class="fas fa-exclamation-triangle fa-lg mt-2"></i>
                    <div class="ms-2">${message}</div>
                </div>
            </div>
        `);
        this.toastElement = this.$compile(toastTemplate)(this.$rootScope);
        angular_1.default.element(document.body).append(this.toastElement);
        // Display the toast
        this.$timeout(() => {
            this.toastElement.css('height', '80px');
        }, 0);
    }
    hideToast() {
        if (this.toastElement) {
            this.toastElement.css('height', '0px');
            this.$timeout(() => {
                this.toastElement.remove();
                this.toastElement = null;
            }, common_1.CONSTANTS.BOTTOM_TOAST_ANIMATION_DURATION); // Match this delay with the CSS transition duration
        }
    }
}
exports.BottomToastService = BottomToastService;
BottomToastService.$inject = ['$timeout', '$compile', '$rootScope'];
exports.bottomToastServiceModule = angular_1.default.module('bottomToastServiceModule', [])
    .service('$bottomToast', BottomToastService);
//# sourceMappingURL=bottom-toast.service.js.map