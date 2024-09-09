import angular from 'angular';
import {
    StateProvider,
    UrlRouterProvider
} from 'angular-ui-router';
import { ConfigurationController, ConnectionController, HomeController, IndexController, PreviewController, RunController } from "../angular-app";
import { CONSTANTS, View } from "../common";
import { IGithubRepoInfo, IRemotePackageJson } from "../models";
import { BrowserConsoleLogService, DatabaseService, GithubService, LogService, NetworkStatusService, PollService, ThemeService, TranslationService } from "../services";
import { CommonUtils } from "../utils";


// Import libraries ------------------------------------------------------------
// Bootstrap
window.bootstrap = require("../../libs/bootstrap/js/bootstrap.bundle.js");

// JQuery modules
require('../../libs/jquery-transfer/js/jquery.transfer.js');
window.JSONEditor = require('../../libs/json-editor/json-editor.js').JSONEditor;

// Standard angular modules
import 'angular';
import 'angular-animate';
import 'angular-messages';
import 'angular-sanitize';
import 'angular-ui-router';
require('../../libs/angular/ng-ui-router-state-events.js');

// Applicaiton angular modules
import '../angular-app';
import '../common/extensions-implementations';

/**
 * Represents the renderer script of the application.
 */
function renderer() {

    // AppGlobal is exposed by the preload script, so we can use it here
    LogService.info("Renderer script executing...");

    // Setup browser console log service --------------------------------------------
    global.appGlobal.browserConsoleLogService = new BrowserConsoleLogService();

    // Setup language --------------------------------------------------------------
    LogService.info("Setting up language...");
    TranslationService.setLanguage();


    // Setup theme ----------------------------------------------------------------
    LogService.info("Setting up theme...");
    ThemeService.setTheme();


    // Loading database -----------------------------------------------------------------
    LogService.info("Loading database...");
    const db = DatabaseService.getOrCreateAppDb();
    LogService.info(`Database loaded. The database contains ${db.workspaces.length} workspaces.`);


    // Backup database ------------------------------------------------------------------
    if (global.appGlobal.packageJson.appConfig.backupOnApplicationStart) {
        LogService.info("Backing up database...");
        DatabaseService.backupAppDb();
    }

    if (global.appGlobal.packageJson.appConfig.backupEveryNMinutes) {
        LogService.info("Scheduling database backup...");
        DatabaseService.scheduleBackupAppDb(global.appGlobal.packageJson.appConfig.backupEveryNMinutes);
    }


    // Initialize network status service --------------------------------------------
    // We create a callback function that will changes the isOffline flag in appGlobal according to the network status
    LogService.info("Initializing network status service...");
    const netStatus = global.appGlobal.networkStatusService = new NetworkStatusService();

    global.appGlobal.isOffline = !netStatus.checkConnection();

    let gitHubPollId: string;
    let appGitHubPollId: string;

    netStatus.on('connectionLost', function connectionLost() {
        LogService.info("Connection lost");
        global.appGlobal.isOffline = true;
        // Pause polling Github repo info since we are offline
        if (gitHubPollId) {
            PollService.pausePolling(gitHubPollId);
            PollService.pausePolling(appGitHubPollId);
        }
    });

    netStatus.on('connectionRestored', function connectionRestored() {
        LogService.info("Connection restored");
        global.appGlobal.isOffline = false;
        // Resume polling Github repo info since we are back online
        if (gitHubPollId) {
            PollService.resumePolling(gitHubPollId);
            PollService.resumePolling(appGitHubPollId);
        }
    });

    // Load Github repo info -------------------------------------------------------
    // Get repo info from Github using the Github service and save it in appGlobal
    // We use the poll service to poll the Github repo info every 10 seconds
    // We poll 10 times and then stop polling
    LogService.info("Loading plugin Github repo info...");
    gitHubPollId = PollService.registerPollCallback(async function pollGithubRepoInfo() {

        const gitHubService = new GithubService();

        global.appGlobal.githubRepoInfo = await gitHubService.getRepoInfoAsync(
            global.appGlobal.packageJson.appConfig.pluginGithubUrl,
            global.appGlobal.packageJson.appConfig.pluginMainBranch) as IGithubRepoInfo;

        if (global.appGlobal.githubRepoInfo.statusCode == 200) {

            LogService.info("Plugin Github repo info loaded");
            global.appGlobal.githubRepoInfo.isLoaded = true;
            return true;
        }

        LogService.warn("Failed to load plugin Github repo info");
        return false;

    }, (id, idFailed, total) => {
        // Reset the poll id when the Github repo info is loaded
        // or when the polling is aborted or failed
        LogService.info(`Polling plugin Github repo info completed. Poll id: ${id}, isAbortedOrFailed: ${idFailed}, totalPollsDone: ${total}`);
        gitHubPollId = null;
    }, CONSTANTS.GIT_HUB_REPO_POLLING.interval,
        CONSTANTS.GIT_HUB_REPO_POLLING.maxRetries,
        true);


    LogService.info("Loading application Github repo info...");
    appGitHubPollId = PollService.registerPollCallback(async function pollGithubRepoInfo() {

        const gitHubService = new GithubService();

        global.appGlobal.appRemotePackageJson = await gitHubService.getRepoPackageJsonAsync(
            global.appGlobal.packageJson.appConfig.appGithubUrl,
            global.appGlobal.packageJson.appConfig.appMainBranch) as IRemotePackageJson;

        if (global.appGlobal.appRemotePackageJson.statusCode == 200) {

            LogService.info("Application package.json file loaded");
            global.appGlobal.appRemotePackageJson.isLoaded = true;

            return true;
        }


        LogService.warn("Failed to load application package.json info");
        return false;

    }, (id, idFailed, total) => {
        // Reset the poll id when the Github repo info is loaded
        // or when the polling is aborted or failed
        LogService.info(`Polling application package.json info completed. Poll id: ${id}, isAbortedOrFailed: ${idFailed}, totalPollsDone: ${total}`);
        appGitHubPollId = null;
    }, CONSTANTS.GIT_HUB_REPO_POLLING.interval,
        CONSTANTS.GIT_HUB_REPO_POLLING.maxRetries,
        true);


    // Create angular app module -------------------------------------------------------
    LogService.info("Creating angular app module...");
    angular.module(CONSTANTS.ANGULAR_APP.appName,
        [
            // Standard angular modules
            'ui.router',
            'ngAnimate',
            'ngSanitize',
            'ngMessages',
            'ui.router.state.events',

            // Application modules
            'appServicesModule',
            'appComponentsModule',
            'appDirectivesModule'
        ]).controller('IndexController', IndexController);

    // Angular app exception handler ---------------------------------------------------
    LogService.info("Setting up angular app exception handler...");
    angular.module(CONSTANTS.ANGULAR_APP.appName).factory('$exceptionHandler', function (): any {
        return function (exception: Error, cause?: string) {
            // Building the error message
            let errorMessage = `Exception: ${exception.message}\n`;

            if (exception.stack) {
                errorMessage += `Stack trace: ${exception.stack}\n`;
            }

            if (cause) {
                errorMessage += `Cause: ${cause}`;
            }
            LogService.errorEx(new Error(errorMessage));
        };
    });


    // Configure angular app -----------------------------------------------------------
    // Object mapping views to their corresponding controllers
    const controllers = {
        [View.home]: HomeController,
        [View.connection]: ConnectionController,
        [View.configuration]: ConfigurationController,
        [View.preview]: PreviewController,
        [View.run]: RunController
    };

    LogService.info("Configuring angular app...");
    angular.module(CONSTANTS.ANGULAR_APP.appName).config(
        (
            $stateProvider: StateProvider,
            $urlRouterProvider: UrlRouterProvider
        ) => {

            // Register all the views
            Object.values(View).forEach(view => {
                $stateProvider.state(view, {
                    url: `/${view}`,
                    templateUrl: `./views/${view}.view.html`,
                    controller: controllers[view],
                    controllerAs: '$ctrl'
                });
            });

            // Register the default view
            $urlRouterProvider.otherwise(`/${View.home}`);

        }
    );


    // Run the angular app -------------------------------------------------------------
    LogService.info("Running angular app...");
    angular.module(CONSTANTS.ANGULAR_APP.appName).run(['$rootScope', function ($rootScope: angular.IRootScopeService) {
        $rootScope.$on('$q:unhandledRejection', function (event: angular.IAngularEvent, rejection: any) {
            const errorString = CommonUtils.parseRejectionIntoErrorString(rejection);
            LogService.errorEx(new Error(`An unhadled promise rejection occured in the angular app: ${errorString}`));
        });
    }]);





}


// Execute the renderer script
renderer();



