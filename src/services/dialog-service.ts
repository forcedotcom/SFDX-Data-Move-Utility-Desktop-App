
import { DialogButton, DialogResult, DialogType, PromptDialogArgs } from "../common";
import { TranslationService } from './translation-service';

export class DialogService {
    /**
    * Displays a dialog.
    * @param message - The dialog message.
    * @param dialogType - The dialog type.
    * @param buttons - The dialog buttons.
    * @param title - The dialog title.
    * @returns The dialog result.
    */
    static showDialog(
        message: string,
        dialogType: DialogType = DialogType.info,
        buttons: DialogButton[] = [DialogButton.ok],
        title?: string
    ): DialogResult {

        const dialog = global.appGlobal.dialog;

        let type: string;

        switch (dialogType) {
            case DialogType.warning:
                title = title || TranslationService.translate({ key: "WARNING" });
                type = 'warning';
                break;
            case DialogType.danger:
                title = title || TranslationService.translate({ key: "ERROR" });
                type = 'error';
                break;
            case DialogType.success:
                title = title || TranslationService.translate({ key: "SUCCESS" });
                type = 'info';
                break;
            default:
                title = title || TranslationService.translate({ key: "INFO" });
                type = 'info';
                break;
        }

        let isSplashWindowShown = false;

        if (!global.appGlobal.splashWindow?.isDestroyed() && global.appGlobal.splashWindow?.isVisible()) {
            isSplashWindowShown = true;
            global.appGlobal.splashWindow.hide();
        }

        const dialogResult = DialogResult[buttons[dialog.showMessageBoxSync(global.appGlobal.mainWindow, {
            title,
            buttons: buttons.filter(button => !!button).map(button => TranslationService.translate({ key: button.toUpperCase() })),
            type: type as any,
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
    static showOpenFileDialog(title?: string): string[] {
        const fileSelection = global.appGlobal.dialog.showOpenDialogSync(global.appGlobal.mainWindow, {
            properties: ['openFile'],
            title: title || TranslationService.translate({ key: "SELECT_FILE" })
        });
        return fileSelection || [];
    }

    /**
     * Displays a save file dialog synchronously.
     * @param title - The dialog title.
     * @returns The selected file path or null if no file was selected.
     */
    static showSaveFileDialog(title?: string, defaultPath?: string): string {
        const fileSelection = global.appGlobal.dialog.showSaveDialogSync(global.appGlobal.mainWindow, {
            properties: ['showOverwriteConfirmation'],
            title: title || TranslationService.translate({ key: "SAVE_FILE" }),
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
    static showPromptDialog(args: PromptDialogArgs): boolean {
        const result = DialogService.showDialog(TranslationService.translate({ key: args.messageKey, params: args.params }),
            args.dialogType || DialogType.yesno,
            [
                args.yesButton || DialogButton.yes,
                args.noButton || DialogButton.no,
                args.cancelButton
            ],
            args.titleKey ? TranslationService.translate({ key: args.titleKey }) : undefined);
        return result == DialogResult.cancel ? null : result == DialogResult.yes;
    }

}