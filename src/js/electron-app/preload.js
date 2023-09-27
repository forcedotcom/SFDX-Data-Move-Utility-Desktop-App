"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("../services");
function preload() {
    // Expose electron protected APIs to the window object --------------------------
    // Expose appGlobal 
    global.appGlobal = require('@electron/remote').getGlobal('appGlobal');
    // We can write log only after appGlobal is exposed because LogService uses appGlobal
    services_1.LogService.info("Preload script executing...");
    // Global error handling --------------------------------------------------------
    // Handle unhandled  synchronous exceptions
    services_1.LogService.info("Setting up global error handling...");
    window.onerror = function windowOnError(message, source, lineno) {
        services_1.LogService.errorEx(new Error(`An unhadled exception occured in the renderer process: ${message} (${source}:${lineno})`));
        // prevents the browser default error handling
        return true;
    };
    // Handle unhandled promise rejections
    window.onunhandledrejection = function windowOnUnhandledRejection(event) {
        event.preventDefault(); // prevents the browser default error handling
        reportError(event.reason);
    };
}
preload();
//# sourceMappingURL=preload.js.map