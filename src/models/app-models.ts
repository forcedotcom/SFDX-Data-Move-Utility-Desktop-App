import { BrowserWindow, Display, Screen } from "electron";
import { BrowserConsoleLogService, NetworkStatusService, ThemeService, WindowService } from "../services";
import { IGithubRepoInfo } from "./github-models";


/**
 * Interface representing the application configuration.
 */
export interface IAppConfig {
    /** Root directory for application data. */
    dataRoot: string;
    /** Root directory for the application itself. */
    appRoot: string;
    /** Filename of the database used by the application. */
    databaseFilename: string;
    /** Array of supported locale strings. */
    locales: string[];
    /** Default locale to use. */
    defaultLocale: string;
    /** Fallback locale to use if the default locale is not available. */
    fallbackLocale: string;
    /** Copyright information for the application. */
    copyrights: string;
    /** URL to the copyright information. */
    copyrightsUrl: string;
    /** URL to the GitHub repository of the plugin. */
    pluginGithubUrl: string;
    /** Title of the plugin. */
    pluginTitle: string;
    /** Description of the plugin. */
    pluginDescription: string;
    /** Main branch name of the plugin's GitHub repository. */
    pluginMainBranch: string;
    /** URL to the GitHub repository of the entire application. */
    appGithubUrl: string;
    /** URL to the knowledge base of the application. */
    knowledgebaseUrl: string;
    /** URL to the knowledge base search of the application. */
    knowledgebaseSearchUrl: string;
    /** Title of the knowledge base. */
    knowledgebaseTitle: string;
    /** URL to opening a new issue on GitHub. */
    getHelpUrl: string;
    /** Flag indicating whether to create a backup on application start. */
    backupOnApplicationStart: boolean;
    /** Flag indicating whether to create a backup in a given interval in minutes. */
    backupEveryNMinutes: number;
    /** Flag indicating whether to use Salesforce CLI commands. */
    useSfCliCommands: boolean;
    /** Theme to use for the application. */
    theme: string;

    //-------------------------------------------------------------------------
    // The following properties are not loaded from the config file but are populated by the application.
    /**  The display text for the copyrights */
    copyrightsDisplayText: (lang: string) => string;

}

/** Interface representing the package.json file. */
export interface IAppPackageJson {
    /** The name of the package. */
    name: string;
    /** The version of the package. */
    version: string;
    /** The application configuration. */
    appConfig: IAppConfig;
    /** The description of the package. */
    description: string;
    /** The author of the package. */
    author: string;
    /** The name of the  application developer. */
    developedBy: string;
    /** The license of the package. */
    license: string;
}

/** Shared data of the application. */
export class AppGlobalData {

    constructor(init: Partial<AppGlobalData> = {}) {
        Object.assign(this, init);
    }

    /** Package.json data. */
    packageJson: IAppPackageJson;
    /** Flag indicating whether the application is in debug mode. */
    isDebug: boolean;
    /** Flag indicating whether the running app is packaged */
    isPackaged: boolean;
    /** The base path of the application. */
    appBasePath: string;
    /** Main window of the application. */
    mainWindow: BrowserWindow;
    /** Splash window of the application. */
    splashWindow: BrowserWindow;
    /** Flag indicating whether the application has an unhandled error. */
    hasUnhandledError: boolean;
    /** The active language. */
    activeLang: string;
    /** Flag indicating whether the active language is right-to-left (RTL). */
    activeLangRtl: boolean;
    /** The active theme. */
    activeTheme: string;
    /** The translations. Map by language code. */
    translations: Record<string, Record<string, string>>;
    /** The GitHub repository information. */
    githubRepoInfo: Partial<IGithubRepoInfo>;
    /** The Electron dialog. */
    dialog: Electron.Dialog;
    /** Flag indicating whether the application is offline. */
    isOffline: boolean;
    /** The UI theme service. */
    themeService: ThemeService;
    /** The network status service. */
    networkStatusService: NetworkStatusService;
    /** The browser console log service. */
    browserConsoleLogService: BrowserConsoleLogService;
    /** The Electron BrowserWindow class. */
    BrowserWindow: typeof BrowserWindow;
    /** The Electron Screen class. */
    screen: Screen;
    /** The current wizard step. */
    wizardStep: number;
    /** Reference to the current display in electron app. */
    display: Display;
    /** The service for managing Electron windows. */
    windowService: WindowService;
    /** The Electron remote module. */
    remoteMain: any;
    /** Whether the OS is Windows. */
    isWindows: boolean;


}


/**
 * Declares the JSONEditor class.
 */
/**
 * Represents a JSON editor that provides functionalities to edit JSON structures
 * within a web interface.
 */
export declare class JSONEditor {
    /**
     * Creates an instance of JSONEditor.
     * @param element The HTMLElement this editor is attached to.
     * @param options Configuration options for the editor.
     */
    constructor(element: HTMLElement, options: any);

    /**
     * Default configuration for the JSONEditor instances.
     */
    static defaults: {
        languages: Record<string, string>; // Holds language settings for the editor.
        language: string; // The default language for the editor.
    };

    /**
     * The theme of the editor.
     */
    theme: string;

    /**
     * Schema that the editor uses for validation and structuring the JSON input.
     */
    schema: any;

    /**
     * Destroys the editor instance, cleaning up DOM elements and event handlers.
     */
    destroy(): void;

    /**
     * Sets the value of the editor with the given JSON data.
     * @param value JSON data to load into the editor.
     */
    setValue(value: any): void;

    /**
     * Validates the structure of the editor against its schema.
     * Returns an array of validation errors, if any.
     */
    validateEditor(): {
        path: string; // Path to the erroneous part in the JSON structure.
        message: string; // Description of the validation error.
    }[];

    /**
     * Retrieves the current value from the editor as JSON.
     */
    getValue(): any;

    /**
     * Retrieves a specific editor instance for the given JSON path.
     * @param path The JSON path to the desired part of the schema.
     */
    getEditor(path: string): JSONEditor;

    /**
     * Validates the current JSON data against the schema, optionally with additional arguments.
     * @param args Optional arguments to pass to the validation function.
     */
    validate(args?: any): {
        path: string; // Path to the erroneous part in the JSON structure.
        message: string; // Description of the validation error.
    }[];

    /**
     * Registers an event handler for a specified event on this editor.
     * @param event The name of the event to listen for.
     * @param callback The callback function to execute when the event is triggered.
     */
    on(event: string, callback: () => void): void;

}

