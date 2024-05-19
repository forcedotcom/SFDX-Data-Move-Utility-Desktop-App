import { BrowserWindow } from 'electron';
import { TranslationService } from '.';
import { CONSTANTS } from '../common';

export class ToastService {

    /**
     * Display an informational toast message.
     *
     * @param {string} message - The message content of the toast.
     * @param {number} delay - The duration (in milliseconds) for which the toast should be visible.
     */
    static showInfo(message?: string, delay = CONSTANTS.TOASTS_DELAY): void {
        message ||= TranslationService.translate({ key: "INFO" });
        ToastService._showToast(message, 'info', global.appGlobal.mainWindow, delay);
    }

    /**
     * Display a success toast message.
     * @param {string} message - The message content of the toast.
     * @param {number} delay - The duration (in milliseconds) for which the toast should be visible.
     */
    static showSuccess(message?: string, delay = CONSTANTS.TOASTS_DELAY): void {
        message ||= TranslationService.translate({ key: "ACTION_SUCCESSFULY_COMPLETED" });
        ToastService._showToast(message, 'success', global.appGlobal.mainWindow, delay);
    }

    /**
     * Display a warning toast message.
     *
     * @param {string} message - The message content of the toast.
     * @param {number} delay- The duration (in milliseconds) for which the toast should be visible.
     */
    static showWarn(message?: string, delay = CONSTANTS.TOASTS_DELAY): void {
        message ||= TranslationService.translate({ key: "ACTION_COMPLETED_WITH_WARNINGS" });
        ToastService._showToast(message, 'warning', global.appGlobal.mainWindow, delay);
    }

    /**
     * Display an error toast message.
     *
     * @param {string} message - The message content of the toast.
     * @param {number} delay - The duration (in milliseconds) for which the toast should be visible.
     */
    static showError(message?: string, delay = CONSTANTS.TOASTS_DELAY): void {
        message ||= TranslationService.translate({ key: "ACTION_COMPLETED_WITH_ERRORS" });
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
    private static _showToast(message: string, type: 'info' | 'warning' | 'error' | 'success', parent: BrowserWindow, delay: number): void {
        let backgroundColor = '';
        let title = '';

        switch (type) {
            case 'info':
                backgroundColor = '#0dcaf0';  // Bootstrap 5 info color
                title = TranslationService.translate({ key: "INFO" });
                break;
            case 'warning':
                backgroundColor = '#ffc107';  // Bootstrap 5 warning color
                title = TranslationService.translate({ key: "WARNING" });
                break;

            case 'success':
                backgroundColor = '#198754';  // Bootstrap 5 success color
                title = TranslationService.translate({ key: "SUCCESS" });
                break;
            case 'error':
                backgroundColor = '#dc3545';  // Bootstrap 5 danger color
                title = TranslationService.translate({ key: "ERROR" });
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


