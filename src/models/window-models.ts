import { BrowserWindow } from "electron";

export interface IWindowSize {
    /** The height of the window. */
    height: number;
    /** The width of the window. */
    width: number;
}


/**
 * Represents an instance of a window.
 */
export interface IWindowInstance {
    /** The browser window object. */
    window: BrowserWindow;
    /** The ID of the window. */
    id: string;
    /** The options used to create the window. */
    options: IWindowOptions;
}

/**
 * Options for creating a window.
 */
export interface IWindowOptions {
    /** The ID of the window. */
    id: string;
    /** The HTML file of the window. */
    htmlFile: string;
    /** The URL of the window. */
    url: string;
    /** Parameters for the window. */
    windowParameters?: Electron.BrowserWindowConstructorOptions;
    /** Whether to display the close button. */
    displayCloseButton?: boolean;
    /** Whether to display the minimize window button. */
    displayMinimizeWindowButton?: boolean;
    /** Whether to display the maximize window button. */
    displayMaximizeWindowButton?: boolean;
    /** The path to the icon for the window. */
    icon: string;
    /** Whether to hide the menu. */
    hideMenu: boolean;
    /** The title of the window. */
    title: string;
    /** Whether to enable dev tools. */
    devTools: boolean;
    /** Whether to display the frame. */
    frame: boolean;
    /** The auto size of the window. */
    autoSize: IWindowSize;
    /** The minimum size of the window. */
    minSize: IWindowSize;
    /** The maximum size of the window. */
    maxSize: IWindowSize;
    /** Whether the window is maximized. */
    maximized: boolean;
    /** Callback function invoked when the window is created.  */
    onCreated?: (window: IWindowInstance) => void;
    /** Callback function invoked when the window is shown. */
    onShown?: (window: IWindowInstance) => void;
    /** Callback function invoked when the window is destroyed. */
    onDestroyed?: (window: IWindowInstance) => void;
    /** The parent window. */
    parent: BrowserWindow;
    /** Whether to skip preload script. */
    skipPreload: boolean;
}

