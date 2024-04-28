import { app, BrowserWindow, dialog, screen, webContents } from "electron";
import { AppPathType, CONSTANTS, DialogType } from "../common";
import { AppGlobalData, IAppConfig } from "../models";
import { DialogService, LogService, WindowService } from "../services";
import { AppUtils, OsUtils } from "../utils";
import { AppConfig } from "../configurations";
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as childProcess from 'child_process';


const remoteMain = require('@electron/remote/main')
const platformFolders = require('platform-folders');

// Application methods -------------------------------------------------
/** Sets up the application. */
function setupApplication() {

  // Initialize the remote module
  remoteMain.initialize();

  app.commandLine.appendSwitch('enable-experimental-web-platform-features');

  // Setup variables
  //VARIABLES.APP_BASE_PATH = app.isPackaged ? app.getAppPath() : '.';

  // Load the app data from the config file
  global.appGlobal = new AppGlobalData({
    isDebug: /--inspect/.test(process.argv.join(' ')),
    isPackaged: app.isPackaged,
    appBasePath: app.isPackaged ? app.getAppPath() : CONSTANTS.APP_BASE_PATH,
    dialog,
    githubRepoInfo: {},
    BrowserWindow,
    screen,
    windowService: WindowService.instance,
    remoteMain: remoteMain,
    isWindows: process.platform === 'win32',
  });
  global.appGlobal.packageJson = require(AppUtils.getAppPath(AppPathType.appPath, 'package.json'));


  // Add information from the runtime configuration file
  const appConfigJson = { ...global.appGlobal.packageJson.appConfig };
  Object.assign(global.appGlobal.packageJson.appConfig, AppConfig);

  // Create app-config.json in documents folder if not exists
  createAppConfigJsonFile(appConfigJson);

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

/**
 * Creates the app-config.json file in the documents folder if it does not exist.
 */
function createAppConfigJsonFile(appConfigJson: IAppConfig) {
  const appConfigJsonPath = path.join(
    platformFolders.getDocumentsFolder(),
    global.appGlobal.packageJson.name,
    CONSTANTS.APP_CONFIG_JSON_FULL_PATH
  );

  fs.ensureDirSync(path.dirname(appConfigJsonPath));
  if (!fs.existsSync(appConfigJsonPath)) {
    fs.writeJsonSync(appConfigJsonPath, appConfigJson, { spaces: 2 });
  }
  Object.assign(global.appGlobal.packageJson.appConfig, fs.readJsonSync(appConfigJsonPath));
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

  //mainWindow.loadFile(path.join(__dirname, "../../index.html"));
  mainWindow.loadFile(AppUtils.getAppPath(AppPathType.appPath, "index.html"));

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

/** * Runs the application this is the main entry point of the application. */
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

/**
* Handle Squirrel events for Windows immediately on start
*/
const handleSquirrelEvent = (app: Electron.App) => {

  if (os.platform() != 'win32') {
    return false;
  }

  if (process.argv.length == 1) {
    return false;
  }

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.join(rootAtomFolder, 'Update.exe');
  const exeName = path.basename(process.execPath);

  const spawn = function (command: any, args: any) {
    let spawnedProcess: any;

    try {
      spawnedProcess = childProcess.spawn(command, args, { detached: true });
    } catch (error) { }

    return spawnedProcess;
  };

  const spawnUpdate = function (args: any[]) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];

  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      spawnUpdate(['--createShortcut', exeName]);
      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      spawnUpdate(['--removeShortcut', exeName]);
      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      app.quit();
      return true;
  }

  return false;
};

if (!handleSquirrelEvent(app)) {

  // Set up the application -----------------------------------------------
  setupApplication();

  // Run the application -------------------------------------------------
  runApplication();
}

export { };

