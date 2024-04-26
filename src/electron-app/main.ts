import { app, BrowserWindow, dialog, screen, webContents } from "electron";
import * as path from "path";
import { AppPathType, CONSTANTS, DialogType } from "../common";
import { AppGlobalData } from "../models";
import { DialogService, LogService, WindowService } from "../services";
import { AppUtils, OsUtils } from "../utils";
import { AppConfig } from "../configurations";


const remoteMain = require('@electron/remote/main')


/** Sets up the application. */
function setupApplication() {

  // Initialize the remote module
  remoteMain.initialize();

  app.commandLine.appendSwitch('enable-experimental-web-platform-features');

  // Load the app data from the config file
  global.appGlobal = new AppGlobalData({
    isDebug: /--inspect/.test(process.argv.join(' ')),
    packageJson: require(AppUtils.getAppPath(AppPathType.appPath, 'package.json')),
    dialog,
    githubRepoInfo: {},
    BrowserWindow,
    screen,
    windowService: WindowService.instance,
    remoteMain: remoteMain,
    isWindows: process.platform === 'win32',
  });

  // From config file
  Object.assign(global.appGlobal.packageJson.appConfig, AppConfig);

  // Populate the global data  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  global.appGlobal.packageJson.appConfig.copyrightsDisplayText = (lang) => {
    // return TranslationService.translate({ key: 'DEVELOPED_BY', lang }) + ': ' + global.appGlobal.packageJson.author
    //   + ' | ' + global.appGlobal.packageJson.appConfig.copyrights.replace('[DATE]', new Date().getFullYear().toString());
    return global.appGlobal.packageJson.appConfig.copyrights.replace('[DATE]', new Date().getFullYear().toString());
  };


  // Setup unhandled errors handling
  process.on('uncaughtException', (error: Error) => {
    LogService.unhandledExeption(error);
  });

}

/** Creates the main window. */
function createMainWindow() {

  // Create the browser window.
  LogService.info("Creating main window...");

  const mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      contextIsolation: false,  // It's considered secured in this app because external pages are not loaded
      nodeIntegration: true,    // We turn on node integration because we want to use node modules in the renderer process. 
      //                           We don't care about security because we don't load external pages in the renderer process.
      sandbox: false,           // We turn off sandbox because we want to use node modules in the renderer process.
      preload: AppUtils.getAppPath(AppPathType.scriptPath, 'electron-app/preload.js'),

    },
    show: false,
    icon: AppUtils.getAppPath(AppPathType.imagesPath, "favicon.png"),
  });

  // Enable the remote module for the main window
  remoteMain.enable(mainWindow.webContents);

  // Set the main window
  global.appGlobal.mainWindow = mainWindow;

  // Set the title
  mainWindow.setTitle(`${global.appGlobal.packageJson.description} v${global.appGlobal.packageJson.version}`);

  // Set the display
  global.appGlobal.display = screen.getPrimaryDisplay();

  // Create the splash window
  LogService.info("Creating splash window...");


  const windowService = global.appGlobal.windowService;
  const splashWindow = windowService.show({
    htmlFile: "splash.html",
    windowParameters: {
      transparent: true
    },
    autoSize: CONSTANTS.WINDOW_DEFAULT_SIZE,
  });

  // Set the splash window
  global.appGlobal.splashWindow = splashWindow.window;

  // Load the index.html of the app.
  LogService.info("Loading main window...");

  mainWindow.loadFile(path.join(__dirname, "../../index.html"));

  // Show the main window when it's ready to be shown
  LogService.info("Showing main window...");

  mainWindow.once('ready-to-show', function mainWindowReadyToShow() {

    // Show the main window after the splash delay
    setTimeout(function mainWindowShown() {

      // Hide the splash window and show the main window
      windowService.hide(splashWindow.id);
      mainWindow.show();

      // Maximize the main window
      mainWindow.maximize();

      LogService.info("Main window shown.");

      // Open the DevTools in debug mode
      if (global.appGlobal.isDebug) {
        mainWindow.webContents.openDevTools();
      } else {
        // Remove the menu in production mode
        mainWindow.removeMenu();
      }



    }, CONSTANTS.SPLASH_DELAY);

  });

  // Emitted when the window is closed.
  // Dereference the window object and destroy it
  mainWindow.on('close', function onMainWindowClose(e: { preventDefault: () => void; }) {
    LogService.info("Main window closed.");
    if (DialogService.showPromptDialog({
      titleKey: 'DIALOG.QUIT_APP.TITLE',
      messageKey: 'DIALOG.QUIT_APP.PROMPT',
      dialogType: DialogType.warning,
    })) {
      webContents.getAllWebContents().forEach(webContent => {
        webContent.close();
      });
      mainWindow.getChildWindows().forEach(childWindow => {
        childWindow.destroy();
      });
      mainWindow.destroy();
    }
    e.preventDefault();
  });

}

// This method will be called when Electron has finished
function runApplication() {

  LogService.info("#\n\n\n\n\n----------------------------------------");
  LogService.info("Application started.");
  LogService.info(JSON.stringify(OsUtils.getOSDetails()));

  app.whenReady().then(function appWhenReady() {

    // Create the main window
    createMainWindow();

    // Called when the application is activated
    app.on("activate", function appActivate() {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });

  }).catch(ex => {
    LogService.unhandledExeption(ex);
  });

  app.on("window-all-closed", function winAllClosed() {
    LogService.info("All windows closed.");
    // On macOS it is common for applications to stay open until the user explicitly quits.
    // We don't want that in our application.
    // So we quit the application when all windows are closed.
    app.quit();
  });
}

// Set up the application
setupApplication();

// Run the application
runApplication();

// We need this because we're using typescript and we don't have any module initializations here.
export { };

