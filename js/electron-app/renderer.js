"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const angular_1 = __importDefault(require("angular"));
const angular_app_1 = require("../angular-app");
const common_1 = require("../common");
const services_1 = require("../services");
const utils_1 = require("../utils");
// Import libraries ------------------------------------------------------------
// Bootstrap
window.bootstrap = require("../../libs/bootstrap/js/bootstrap.bundle.js");
// JQuery modules
require('../../libs/jquery-transfer/js/jquery.transfer.js');
window.JSONEditor = require('../../libs/json-editor/json-editor.js').JSONEditor;
// Standard angular modules
require("angular");
require("angular-animate");
require("angular-messages");
require("angular-sanitize");
require("angular-ui-router");
require('../../libs/angular/ng-ui-router-state-events.js');
// Applicaiton angular modules
require("../angular-app");
require("../common/extensions-implementations");
/**
 * Represents the renderer script of the application.
 */
function renderer() {
    // AppGlobal is exposed by the preload script, so we can use it here
    services_1.LogService.info("Renderer script executing...");
    // Setup browser console log service --------------------------------------------
    global.appGlobal.browserConsoleLogService = new services_1.BrowserConsoleLogService();
    // Setup language --------------------------------------------------------------
    services_1.LogService.info("Setting up language...");
    services_1.TranslationService.setLanguage();
    // Setup theme ----------------------------------------------------------------
    services_1.LogService.info("Setting up theme...");
    services_1.ThemeService.setTheme();
    // Loading database -----------------------------------------------------------------
    services_1.LogService.info("Loading database...");
    const db = services_1.DatabaseService.getOrCreateAppDb();
    services_1.LogService.info(`Database loaded. The database contains ${db.workspaces.length} workspaces.`);
    // Backup database ------------------------------------------------------------------
    if (global.appGlobal.packageJson.appConfig.backupOnApplicationStart) {
        services_1.LogService.info("Backing up database...");
        services_1.DatabaseService.backupAppDb();
    }
    if (global.appGlobal.packageJson.appConfig.backupEveryNMinutes) {
        services_1.LogService.info("Scheduling database backup...");
        services_1.DatabaseService.scheduleBackupAppDb(global.appGlobal.packageJson.appConfig.backupEveryNMinutes);
    }
    // Initialize network status service --------------------------------------------
    // We create a callback function that will changes the isOffline flag in appGlobal according to the network status
    services_1.LogService.info("Initializing network status service...");
    const netStatus = global.appGlobal.networkStatusService = new services_1.NetworkStatusService();
    global.appGlobal.isOffline = !netStatus.checkConnection();
    let gitHubPollId;
    netStatus.on('connectionLost', function connectionLost() {
        services_1.LogService.info("Connection lost");
        global.appGlobal.isOffline = true;
        // Pause polling github repo info since we are offline
        if (gitHubPollId) {
            services_1.PollService.pausePolling(gitHubPollId);
        }
    });
    netStatus.on('connectionRestored', function connectionRestored() {
        services_1.LogService.info("Connection restored");
        global.appGlobal.isOffline = false;
        // Resume polling github repo info since we are back online
        if (gitHubPollId) {
            services_1.PollService.resumePolling(gitHubPollId);
        }
    });
    // Load github repo info -------------------------------------------------------
    // Get repo info from github using the github service and save it in appGlobal
    // We use the poll service to poll the github repo info every 10 seconds
    // We poll 10 times and then stop polling
    services_1.LogService.info("Loading github repo info...");
    gitHubPollId = services_1.PollService.registerPollCallback(async function pollGithubRepoInfo() {
        const gitHubService = new services_1.GithubService();
        global.appGlobal.githubRepoInfo = await gitHubService.getRepoInfoAsync(global.appGlobal.packageJson.appConfig.pluginGithubUrl, global.appGlobal.packageJson.appConfig.pluginMainBranch);
        if (global.appGlobal.githubRepoInfo.statusCode == 200) {
            services_1.LogService.info("Github repo info loaded");
            global.appGlobal.githubRepoInfo.isLoaded = true;
            return true;
        }
        services_1.LogService.warn("Failed to load github repo info");
        return false;
    }, (id, idFailed, total) => {
        // Reset the poll id when the github repo info is loaded
        // or when the polling is aborted or failed
        services_1.LogService.info(`Polling github repo info completed. Poll id: ${id}, isAbortedOrFailed: ${idFailed}, totalPollsDone: ${total}`);
        gitHubPollId = null;
    }, common_1.CONSTANTS.GIT_HUB_REPO_POLLING.interval, common_1.CONSTANTS.GIT_HUB_REPO_POLLING.maxRetries, true);
    // Create angular app module -------------------------------------------------------
    services_1.LogService.info("Creating angular app module...");
    angular_1.default.module(common_1.CONSTANTS.ANGULAR_APP.appName, [
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
    ]).controller('IndexController', angular_app_1.IndexController);
    // Angular app exception handler ---------------------------------------------------
    services_1.LogService.info("Setting up angular app exception handler...");
    angular_1.default.module(common_1.CONSTANTS.ANGULAR_APP.appName).factory('$exceptionHandler', function () {
        return function (exception, cause) {
            // Building the error message
            let errorMessage = `Exception: ${exception.message}\n`;
            if (exception.stack) {
                errorMessage += `Stack trace: ${exception.stack}\n`;
            }
            if (cause) {
                errorMessage += `Cause: ${cause}`;
            }
            services_1.LogService.errorEx(new Error(errorMessage));
        };
    });
    // Configure angular app -----------------------------------------------------------
    // Object mapping views to their corresponding controllers
    const controllers = {
        [common_1.View.home]: angular_app_1.HomeController,
        [common_1.View.connection]: angular_app_1.ConnectionController,
        [common_1.View.configuration]: angular_app_1.ConfigurationController,
        [common_1.View.preview]: angular_app_1.PreviewController,
        [common_1.View.run]: angular_app_1.RunController
    };
    services_1.LogService.info("Configuring angular app...");
    angular_1.default.module(common_1.CONSTANTS.ANGULAR_APP.appName).config(($stateProvider, $urlRouterProvider) => {
        // Register all the views
        Object.values(common_1.View).forEach(view => {
            $stateProvider.state(view, {
                url: `/${view}`,
                templateUrl: `./views/${view}.view.html`,
                controller: controllers[view],
                controllerAs: '$ctrl'
            });
        });
        // Register the default view
        $urlRouterProvider.otherwise(`/${common_1.View.home}`);
    });
    // Run the angular app -------------------------------------------------------------
    services_1.LogService.info("Running angular app...");
    angular_1.default.module(common_1.CONSTANTS.ANGULAR_APP.appName).run(['$rootScope', function ($rootScope) {
            $rootScope.$on('$q:unhandledRejection', function (event, rejection) {
                const errorString = utils_1.CommonUtils.parseRejectionIntoErrorString(rejection);
                services_1.LogService.errorEx(new Error(`An unhadled promise rejection occured in the angular app: ${errorString}`));
            });
        }]);
}
// Execute the renderer script
renderer();
//# sourceMappingURL=renderer.js.map