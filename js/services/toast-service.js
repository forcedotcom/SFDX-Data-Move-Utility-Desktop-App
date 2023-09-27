"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const common_1 = require("../common");
class ToastService {
    /**
     * Display an informational toast message.
     *
     * @param {string} message - The message content of the toast.
     * @param {number} delay - The duration (in milliseconds) for which the toast should be visible.
     */
    static showInfo(message, delay = common_1.CONSTANTS.TOASTS_DELAY) {
        message || (message = _1.TranslationService.translate({ key: "INFO" }));
        ToastService._showToast(message, 'info', global.appGlobal.mainWindow, delay);
    }
    /**
     * Display a success toast message.
     * @param {string} message - The message content of the toast.
     * @param {number} delay - The duration (in milliseconds) for which the toast should be visible.
     */
    static showSuccess(message, delay = common_1.CONSTANTS.TOASTS_DELAY) {
        message || (message = _1.TranslationService.translate({ key: "ACTION_SUCCESSFULY_COMPLETED" }));
        ToastService._showToast(message, 'success', global.appGlobal.mainWindow, delay);
    }
    /**
     * Display a warning toast message.
     *
     * @param {string} message - The message content of the toast.
     * @param {number} delay- The duration (in milliseconds) for which the toast should be visible.
     */
    static showWarn(message, delay = common_1.CONSTANTS.TOASTS_DELAY) {
        message || (message = _1.TranslationService.translate({ key: "ACTION_COMPLETED_WITH_WARNINGS" }));
        ToastService._showToast(message, 'warning', global.appGlobal.mainWindow, delay);
    }
    /**
     * Display an error toast message.
     *
     * @param {string} message - The message content of the toast.
     * @param {number} delay - The duration (in milliseconds) for which the toast should be visible.
     */
    static showError(message, delay = common_1.CONSTANTS.TOASTS_DELAY) {
        message || (message = _1.TranslationService.translate({ key: "ACTION_COMPLETED_WITH_ERRORS" }));
        ToastService._showToast(message, 'error', global.appGlobal.mainWindow, delay);
    }
    /**
     * Display a toast with a specified type, message, and duration over a parent window.
     *
     * @private
     * @param {string} message - The message content of the toast.
     * @param {'info' | 'warning' | 'error'} type - The type of toast, which determines its styling.
     * @param {BrowserWindow} parent - The parent window over which the toast should be displayed.
     * @param {number} delay - The duration (in milliseconds) for which the toast should be visible.
     */
    static _showToast(message, type, parent, delay) {
        let backgroundColor = '';
        let title = '';
        switch (type) {
            case 'info':
                backgroundColor = '#0dcaf0'; // Bootstrap 5 info color
                title = _1.TranslationService.translate({ key: "INFO" });
                break;
            case 'warning':
                backgroundColor = '#ffc107'; // Bootstrap 5 warning color
                title = _1.TranslationService.translate({ key: "WARNING" });
                break;
            case 'success':
                backgroundColor = '#198754'; // Bootstrap 5 success color
                title = _1.TranslationService.translate({ key: "SUCCESS" });
                break;
            case 'error':
                backgroundColor = '#dc3545'; // Bootstrap 5 danger color
                title = _1.TranslationService.translate({ key: "ERROR" });
                break;
        }
        const toastWindow = global.appGlobal.windowService.show({
            skipPreload: true,
            url: `data:text/html;charset=UTF-8,${encodeURIComponent(`
                    <div style="font-family: Arial, sans-serif; padding: 12px 12px 32px 12px; border-radius: .25rem; background-color: ${backgroundColor}; color: #FFF;">
                        <strong style="display: block; margin-bottom: 5px;">
                            ${title}
                        </strong>
                        ${message}
                    </div>
                    <style>
                        body { overflow: hidden;  }
                    </style>
                `)}`,
            windowParameters: {
                backgroundColor: '#00FFFFFF',
                width: 300,
                height: 100,
                frame: false,
                transparent: true,
                alwaysOnTop: true,
                skipTaskbar: true,
                show: false,
                parent: parent,
                modal: false,
                webPreferences: {
                    nodeIntegration: true
                }
            }
        });
        // Positioning toast at the top middle of the parent window
        const parentBounds = parent.getBounds();
        const x = parentBounds.x + (parentBounds.width - 300) / 2;
        const y = parentBounds.y + 10;
        toastWindow.window.setPosition(x, y, false);
        toastWindow.window.show();
        // Auto-close after specified delay
        setTimeout(() => {
            //toastWindow.window.close();
            global.appGlobal.windowService.hide(toastWindow.id);
        }, delay);
    }
}
exports.default = ToastService;
//# sourceMappingURL=toast-service.js.map