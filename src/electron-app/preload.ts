import { LogService } from "../services";


function preload() {



    // Expose electron protected APIs to the window object --------------------------
    // Expose appGlobal 
    global.appGlobal = require('@electron/remote').getGlobal('appGlobal');

    // We can write log only after appGlobal is exposed because LogService uses appGlobal
    LogService.info("Preload script executing...");

    // Global error handling --------------------------------------------------------
    // Handle unhandled  synchronous exceptions
    LogService.info("Setting up global error handling...");
    window.onerror = function windowOnError(message, source, lineno) {
        LogService.errorEx(new Error(`An unhadled exception occured in the renderer process: ${message} (${source}:${lineno})`));
        // prevents the browser default error handling
        return true;
    };

    // Handle unhandled promise rejections
    window.onunhandledrejection = function windowOnUnhandledRejection(event: PromiseRejectionEvent) {
        event.preventDefault(); // prevents the browser default error handling
        reportError(event.reason);
    };

}

preload();