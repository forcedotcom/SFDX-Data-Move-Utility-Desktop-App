"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowService = void 0;
const common_1 = require("../common");
const utils_1 = require("../utils");
/**
 * The service for managing electron child browser windows.
 */
class WindowService {
    constructor() {
        /**
         * Map of window IDs to window instances.
         */
        this.windows = new Map();
    }
    /**
     * Gets the singleton instance of the WindowService.
     */
    static get instance() {
        if (!this._wmService) {
            this._wmService = new WindowService();
        }
        return this._wmService;
    }
    /**
     * Creates a new window instance with the given options.
     * @param options - The options for creating the window.
     * @returns The created window instance.
     */
    createWindow(options) {
        const id = options.id || utils_1.CommonUtils.randomString();
        // Set default options and override with provided options
        options = {
            ...options,
            ...{
                hideMenu: true,
                icon: utils_1.AppUtils.getAppPath(common_1.AppPathType.imagesPath, "favicon.png"),
                parent: options.parent || global.appGlobal.mainWindow,
            }
        };
        // Configure window parameters
        const windowParameters = utils_1.CommonUtils.assignDefinedDeep({
            transparent: false,
            alwaysOnTop: true,
            title: options.title,
            backgroundColor: '#FFFFFF',
            center: true,
            frame: options.displayCloseButton || options.displayMinimizeWindowButton || options.displayMaximizeWindowButton || options.frame,
            webPreferences: {
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: false,
                devTools: options.devTools,
                preload: options.skipPreload ? undefined : utils_1.AppUtils.getAppPath(common_1.AppPathType.scriptPath, "electron-app/preload.js"),
            },
            show: false,
        }, options.windowParameters);
        // Create a new BrowserWindow
        const newWindow = new global.appGlobal.BrowserWindow(windowParameters);
        global.appGlobal.remoteMain.enable(newWindow.webContents);
        if (options.url)
            newWindow.loadURL(options.url);
        else
            newWindow.loadFile(utils_1.AppUtils.getAppPath(common_1.AppPathType.appPath, options.htmlFile));
        const window = {
            window: newWindow,
            id,
            options
        };
        // Apply window settings based on options
        if (options.hideMenu)
            newWindow.setMenu(null);
        if (!options.displayCloseButton)
            newWindow.setClosable(false);
        if (!options.displayMinimizeWindowButton)
            newWindow.setMinimizable(false);
        if (!options.displayMaximizeWindowButton)
            newWindow.setMaximizable(false);
        if (options.icon)
            newWindow.setIcon(options.icon);
        if (options.maximized)
            newWindow.maximize();
        // Set resize behavior
        const resize = () => {
            if (options.minSize) {
                newWindow.setMinimumSize(options.minSize.width, options.maxSize.height);
            }
            if (options.maxSize) {
                newWindow.setMaximumSize(options.maxSize.width, options.maxSize.height);
            }
            if (options.autoSize) {
                const { width, height } = global.appGlobal.display.workAreaSize;
                const maxWidth = Math.min(width, options.autoSize.width);
                const maxHeight = Math.min(height, options.autoSize.height);
                const minWidth = Math.min(width, options.autoSize.width);
                const minHeight = Math.min(height, options.autoSize.height);
                newWindow.setSize(options.autoSize.width, options.autoSize.height);
                newWindow.setMinimumSize(minWidth, minHeight);
                newWindow.setMaximumSize(maxWidth, maxHeight);
            }
        };
        resize();
        newWindow.on('resized', resize);
        // Invoke onCreated callback if provided
        if (options.onCreated) {
            options.onCreated(window);
        }
        // Show the window when it is ready
        newWindow.once('ready-to-show', () => {
            newWindow.show();
            if (options.devTools) {
                newWindow.webContents.openDevTools();
            }
            // Invoke onShown callback if provided
            if (options.onShown) {
                options.onShown(window);
            }
        });
        // Clean up and remove window from the map when closed
        newWindow.on('closed', () => {
            this.hide(id);
        });
        // Add the window to the map
        this.windows.set(id, window);
        return window;
    }
    /**
     * Shows a new window with the specified options.
     * @param options - The options for creating the window.
     * @returns The created window instance.
     */
    show(options) {
        return this.createWindow(options);
    }
    /**
     * Shows a new window asynchronously with the specified options.
     * @param options - The options for creating the window.
     * @returns A promise that resolves to the created window instance.
     */
    async showAsync(options) {
        return new Promise((resolve) => {
            const winInstance = this.createWindow(options);
            const oldOnShown = options.onShown;
            options.onShown = () => {
                if (oldOnShown) {
                    oldOnShown(winInstance);
                }
                resolve(winInstance);
            };
        });
    }
    /**
     * Hides and destroys the window with the specified ID.
     * @param id - The ID of the window to hide.
     */
    hide(id) {
        const windowInstance = this.windows.get(id);
        if (windowInstance) {
            this.windows.delete(id);
            windowInstance.window.destroy();
            // Invoke onDestroyed callback if provided
            if (windowInstance.options.onDestroyed) {
                windowInstance.options.onDestroyed(windowInstance);
            }
        }
    }
    /**
     * Gets all the window instances managed by the WindowService.
     * @returns A map of window IDs to window instances.
     */
    getAll() {
        return this.windows;
    }
}
exports.WindowService = WindowService;
//# sourceMappingURL=window-service.js.map