import { app, BrowserWindow } from "electron";
import * as path from "path";
import { consoleUtils } from "./code/app/consoleUtils";
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
const isDev = require('electron-is-dev');

// Initialize & start Express application
require('./express-main');

// JSX compile
// import gulp = require('gulp');
// import react = require('gulp-react');
// import concat = require('gulp-concat');
// gulp.task('scripts', function () {
//   return gulp.src([path.join(__dirname, '../src/jsx/*.jsx')])
//     .pipe(concat('components.js'))
//     .pipe(react())
//     .pipe(gulp.dest(path.join(__dirname, '../src/public/javascripts')));
// });
// gulp.series(gulp.task('scripts'))();

let mainWindow: Electron.BrowserWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 1024,
    width: 768,
    title: "SFDMU",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true
    },
    icon: path.join(__dirname, "../resources/images/favicon.png")
  });

  // and load main url
  mainWindow.maximize();
  mainWindow.loadURL(`http://localhost:3000/`);

  // Hide menu on production
  if (!isDev || !(process.argv.length > 1 && process.argv.filter(arg => arg == "--debug").length > 0)) {
    mainWindow.removeMenu();
    process.env.IS_DEBUG = "false";
  } else {
    process.env.IS_DEBUG = "true";
  }

  mainWindow.on("close", (e) => {
    if (consoleUtils.hasRunningConsoleProcess()) {
      e.preventDefault();
      consoleUtils.killRunningConsoleProcess(true);
    }
  });


  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q


  if (process.platform !== "darwin") {
    app.quit();
  }

});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
