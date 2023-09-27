"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogService = void 0;
const common_1 = require("../common");
const translation_service_1 = require("./translation-service");
class DialogService {
    /**
    * Displays a dialog.
    * @param message - The dialog message.
    * @param dialogType - The dialog type.
    * @param buttons - The dialog buttons.
    * @param title - The dialog title.
    * @returns The dialog result.
    */
    static showDialog(message, dialogType = common_1.DialogType.info, buttons = [common_1.DialogButton.ok], title) {
        const dialog = global.appGlobal.dialog;
        let type;
        switch (dialogType) {
            case common_1.DialogType.warning:
                title = title || translation_service_1.TranslationService.translate({ key: "WARNING" });
                type = 'warning';
                break;
            case common_1.DialogType.danger:
                title = title || translation_service_1.TranslationService.translate({ key: "ERROR" });
                type = 'error';
                break;
            case common_1.DialogType.success:
                title = title || translation_service_1.TranslationService.translate({ key: "SUCCESS" });
                type = 'info';
                break;
            default:
                title = title || translation_service_1.TranslationService.translate({ key: "INFO" });
                type = 'info';
                break;
        }
        let isSplashWindowShown = false;
        if (!global.appGlobal.splashWindow.isDestroyed() && global.appGlobal.splashWindow.isVisible()) {
            isSplashWindowShown = true;
            global.appGlobal.splashWindow.hide();
        }
        const dialogResult = common_1.DialogResult[buttons[dialog.showMessageBoxSync(global.appGlobal.mainWindow, {
            title,
            buttons: buttons.filter(button => !!button).map(button => translation_service_1.TranslationService.translate({ key: button.toUpperCase() })),
            type: type,
            message,
        })]];
        if (isSplashWindowShown) {
            global.appGlobal.splashWindow.show();
        }
        return dialogResult;
    }
    /**
       *  Displays an open file dialog synchronously.
       * @param title  - The dialog title.
       * @returns  Array of the selected file(s) paths or empty array if no file was selected.
       */
    static showOpenFileDialog(title) {
        const fileSelection = global.appGlobal.dialog.showOpenDialogSync(global.appGlobal.mainWindow, {
            properties: ['openFile'],
            title: title || translation_service_1.TranslationService.translate({ key: "SELECT_FILE" })
        });
        return fileSelection || [];
    }
    /**
     * Displays a save file dialog synchronously.
     * @param title - The dialog title.
     * @returns The selected file path or null if no file was selected.
     */
    static showSaveFileDialog(title, defaultPath) {
        const fileSelection = global.appGlobal.dialog.showSaveDialogSync(global.appGlobal.mainWindow, {
            properties: ['showOverwriteConfirmation'],
            title: title || translation_service_1.TranslationService.translate({ key: "SAVE_FILE" }),
            defaultPath
        });
        return fileSelection || null;
    }
    /**
     * Displays prompt dialog.
     * @param args - The dialog arguments.
     * @returns The dialog result.
     * If the dialog is canceled, returns null.
     * Otherwise, returns true if the user clicked the Yes button, or false if the user clicked the No button.
     */
    static showPromptDialog(args) {
        const result = DialogService.showDialog(translation_service_1.TranslationService.translate({ key: args.messageKey, params: args.params }), args.dialogType || common_1.DialogType.yesno, [
            args.yesButton || common_1.DialogButton.yes,
            args.noButton || common_1.DialogButton.no,
            args.cancelButton
        ], args.titleKey ? translation_service_1.TranslationService.translate({ key: args.titleKey }) : undefined);
        return result == common_1.DialogResult.cancel ? null : result == common_1.DialogResult.yes;
    }
}
exports.DialogService = DialogService;
//# sourceMappingURL=dialog-service.js.map