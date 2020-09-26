"use strict";
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const deepClone = __importStar(require("deep.clone"));
const jquery_1 = __importDefault(require("jquery"));
const mime_types_1 = __importDefault(require("mime-types"));
const appUIState_1 = require("./appUIState");
const appUtils_1 = require("./appUtils");
const soql_parser_js_1 = require("soql-parser-js");
const config_1 = require("../models/config");
const statics_1 = require("./statics");
const dbUtils_1 = require("./dbUtils");
const form_1 = require("../models/form");
const helper_classes_1 = require("./helper_classes");
const org_1 = require("../models/org");
const resources_1 = require("./resources");
const scriptMappingItem_1 = require("../models/scriptMappingItem");
const scriptObject_1 = require("../models/scriptObject");
const ScriptObjectField_1 = require("../models/ScriptObjectField");
const userDataWrapper_1 = require("../models/userDataWrapper");
const fs = require("fs");
const path = require("path");
const consoleUtils_1 = require("./consoleUtils");
const scriptMockField_1 = require("../models/scriptMockField");
const $ = jquery_1.default;
class Controller {
    // ---------   //
    constructor(controllerData) {
        /////////////////////////////////////////////////////////////////////
        // Private members //////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////
        // Fields **************************************************
        this._blockAddRemoveObjectFieldsEvent = false;
        this._blockRemoveObjectExcludedFieldsEvent = false;
        this._blockExternalIdChangedEvent = false;
        this._blockOnPolymorphicFieldChangedEvent = false;
        appUtils_1.AppUtils.objectApply(this, controllerData);
    }
    get ui() {
        return this.$scope.ui;
    }
    ////////////////////////////////////////////////////////////
    // Common //////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    init() {
        // Setup controller //////
        this.controllerSetup(true);
    }
    controllerSetup(isInitialSetup) {
        let self = this;
        // Each-time setup ////////
        this.$scope.ui = new appUIState_1.AppUIState(this);
        this.$scope.res = resources_1.RESOURCES;
        // Initial setup only ///////
        if (isInitialSetup) {
            // Setup window object              
            document.title = appUIState_1.AppUIState.appSettings.app_title;
            this.bootbox = this.$window["bootbox"];
            // Setup watchers
            this._addWhatcher("ui.state.sobject().query", this.objectQueryChangedHandler);
            this._addWhatcher("ui.homePage.currentSourceOrgIds", this.orgChangedHandler);
            this._addWhatcher("ui.homePage.currentTargetOrgIds", this.orgChangedHandler);
            this._addWhatcher("ui.configPage.allConfigIds", this.configChangedHandler);
            this.$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
                // Switch between tabs in the main menu
                $('.side-nav a').removeClass('active');
                $(`.side-nav a[data-state="${toState.name}"]`).addClass('active');
                // What to do on state change ?
                switch (toState.name) {
                    case "login":
                        self.loginPageSetup();
                        break;
                    case "register":
                        self.registerPageSetup();
                        break;
                    case "home":
                        if (fromState.name == "login") {
                            self.homePageSetup();
                        }
                        break;
                    // case "config":
                    //     break;
                    // case "preview":
                    //     // TODO:
                    //     break;
                    // case "execute":
                    //     // TODO:
                    //     break;
                    case "profile":
                        self.profilePageSetup();
                        break;
                }
            });
            // Go to the login page
            appUtils_1.AppUtils.execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
                $('#wrapper').removeClass('hidden');
                this.$state.go('login');
                this._refreshUI();
            }), 50);
        }
    }
    switchStateHandler(state) {
        this.$state.go(state);
    }
    openBasePathInExplorerHandler() {
        appUtils_1.AppUtils.openExplorer(this.ui.state.userData.basePath);
    }
    openConfigInExplorerHandler() {
        if (fs.existsSync(this.ui.state.config().exportJsonFilepath))
            appUtils_1.AppUtils.openExplorer(this.ui.state.config().exportJsonFilepath);
        else
            this.openBasePathInExplorerHandler();
    }
    ////////////////////////////////////////////////////////////////
    // Login page //////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    loginPageSetup() {
        this.controllerSetup();
        this._displayNewVersionMessage();
        this._refreshUI();
    }
    loginHandler() {
        if (this.ui.loginPage.form.isValid()) {
            this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
                let u = yield dbUtils_1.DbUtils.findAndLoadUserDataAsync(this.ui.loginPage.form.email, this.ui.loginPage.form.password);
                if (u) {
                    this.ui.state.userData = new userDataWrapper_1.UserDataWrapper().fromSecuredObject(u, this.ui.loginPage.form.password);
                    yield dbUtils_1.DbUtils.compactDbAsync();
                    this.$state.go('home');
                    this._refreshUI();
                }
                else {
                    this.$scope.$apply(() => this.ui.loginPage.form.invalid = true);
                }
            }));
        }
    }
    logOffHandler() {
        this.ui.state.userData = undefined;
        this.ui.loginPage.form = new form_1.Form();
        this.ui.registerPage.form = new form_1.Form();
        this.$state.go('login');
        this._refreshUI();
    }
    //////////////////////////////////////////////////////////////
    // Register page /////////////////////////////////////////////
    //////////////////////////////////////////////////////////////
    registerPageSetup() {
        this.controllerSetup();
        this._refreshUI();
    }
    registerHandler() {
        if (this.ui.registerPage.form.isValid()) {
            this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
                let u = yield dbUtils_1.DbUtils.findAndLoadUserDataAsync(this.ui.registerPage.form.email, this.ui.registerPage.form.password);
                if (u) {
                    this.$scope.$apply(() => this.ui.registerPage.form.invalid = true);
                    return;
                }
                this.ui.state.userData = new userDataWrapper_1.UserDataWrapper({
                    plainEmail: this.ui.registerPage.form.email,
                    plainPassword: this.ui.registerPage.form.password
                });
                yield dbUtils_1.DbUtils.insertUserAsync(this.ui.state.userData);
                yield dbUtils_1.DbUtils.compactDbAsync();
                // Go next page
                this.$state.go('home');
            }));
        }
    }
    /////////////////////////////////////////////////////////////////////
    // Profile page ///////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////
    profilePageSetup() {
        this.ui.profilePage.form = new form_1.Form({
            email: this.ui.state.userData.plainEmail,
            password: this.ui.state.userData.plainPassword
        });
        appUtils_1.AppUtils.objectAssignSafe(this.ui.profilePage.settingsForm, appUIState_1.AppUIState.appSettings);
        this._refreshUI();
    }
    saveEmailAndPasswordHandler() {
        if (this.ui.profilePage.form.isValid()) {
            this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
                let u = this.ui.profilePage.form.email != this.ui.state.userData.plainEmail
                    && (yield dbUtils_1.DbUtils.findAndLoadUserDataAsync(this.ui.profilePage.form.email, this.ui.profilePage.form.password));
                if (u) {
                    this.$scope.$apply(() => this.ui.profilePage.form.invalid = true);
                    return;
                }
                this.ui.state.userData.plainEmail = this.ui.profilePage.form.email;
                this.ui.state.userData.plainPassword = this.ui.profilePage.form.password;
                yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
                this.ui.profilePage.form.invalid = false;
                this.$scope.$apply(undefined);
                this._showUIToast("success", {
                    content: resources_1.RESOURCES.Profile_UserProfileSaved
                });
            }));
        }
    }
    openChangeBasePathDialogHandler() {
        let newPaths = appUtils_1.AppUtils.selectFolder(appUIState_1.AppUIState.appSettings.db_basePath);
        this.ui.profilePage.settingsForm.db_basePath = newPaths && newPaths[0] || this.ui.profilePage.settingsForm.db_basePath;
    }
    saveApplicationSettingsHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            appUtils_1.AppUtils.writeUserJson(this.ui.profilePage.settingsForm);
            appUtils_1.AppUtils.objectAssignSafe(appUIState_1.AppUIState.appSettings, this.ui.profilePage.settingsForm);
            if (dbUtils_1.DbUtils.getDbFilePath() != this.ui.profilePage.settingsForm.db_basePath // Path is changed
                || dbUtils_1.DbUtils.getDbFilenameWithoutPath() != this.ui.profilePage.settingsForm.db_name /*Name is changed*/) {
                yield dbUtils_1.DbUtils.moveDbAsync(this.ui.profilePage.settingsForm.db_moveFiles);
            }
            this._refreshUI();
            this._showUIToast("success", {
                content: resources_1.RESOURCES.Profile_UserProfileSaved
            });
        }));
    }
    /////////////////////////////////////////////////////////////////////
    // Home (connection) page ///////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    homePageSetup() {
        this._refreshUI();
    }
    orgChangedHandler($new, $old, $scope) {
        $scope.ui.state.setSourceTargetOrgs();
    }
    refreshOrgsListHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            this._showUILoader(resources_1.RESOURCES.Home_Message_ReadingOrgList);
            let orgList = yield appUtils_1.AppUtils.execForceOrgList();
            if (orgList.orgs.length == 0) {
                this._showUIToast("warning", {
                    title: resources_1.RESOURCES.DefaultToastWarningTitle,
                    content: resources_1.RESOURCES.Home_Message_NoSFDXOrgsDetected
                });
            }
            this.ui.state.userData.orgs = [].concat(orgList.orgs.map(org => {
                return new org_1.Org({
                    instanceUrl: org.instanceUrl,
                    orgId: org.orgId,
                    orgName: org.username,
                    name: org.username,
                    media: statics_1.DATA_MEDIA_TYPE.Org
                });
            }), this.ui.state.userData.orgs.filter(org => org.orgName == statics_1.CONSTANTS.CSV_FILES_SOURCENAME));
            yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
            this.$scope.$apply(undefined);
        }));
    }
    executeForceOrgListHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            this._showUILoader(resources_1.RESOURCES.Home_Message_ExecutingForceOrgList);
            let result = yield appUtils_1.AppUtils.execForceOrgList();
            this.ui.homePage.cliOutputPlain = result.commandOutput;
            this.ui.homePage.cliOutput = this._textToHtml(result.commandOutput);
            this.$scope.$apply(undefined);
        }));
    }
    executeForceOrgDisplayHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            let commandOutputArr = [];
            if (this.ui.state.sourceOrg().isOrg()) {
                this._showUILoader(resources_1.RESOURCES.Home_Message_ExecutingForceOrgDisplay.format(this.ui.state.sourceOrg().name));
                commandOutputArr.push((yield appUtils_1.AppUtils.execForceOrgDisplay(this.ui.state.sourceOrg().name, true)).commandOutput.trim());
            }
            if (this.ui.state.targetOrg().isOrg()) {
                this._showUILoader(resources_1.RESOURCES.Home_Message_ExecutingForceOrgDisplay.format(this.ui.state.targetOrg().name));
                commandOutputArr.push((yield appUtils_1.AppUtils.execForceOrgDisplay(this.ui.state.targetOrg().name, true)).commandOutput.trim());
            }
            let commandOutput = "";
            if (commandOutputArr.length > 0) {
                commandOutput = `[${commandOutputArr.join(',')}]`;
                commandOutput = appUtils_1.AppUtils.pretifyJson(commandOutput);
            }
            else {
                commandOutput = resources_1.RESOURCES.Home_Message_SelectSourceOrTarget;
            }
            this.ui.homePage.cliOutputPlain = commandOutput;
            this.ui.homePage.cliOutput = this._textToHtml(commandOutput);
            this.$scope.$apply(undefined);
        }));
    }
    downloadCLICommadOutputHandler() {
        this._showUILoader();
        let fileName = this.ui.state.userData.cliCommadOutputFilename;
        fs.writeFileSync(fileName, this.ui.homePage.cliOutputPlain);
        this._hideUILoader();
        this._downloadFile(fileName);
    }
    homeGoNext() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            // Set Source/Target orgs
            this.ui.state.setSourceTargetOrgs();
            yield this._connectOrgsAsync();
            // Go next page
            this.configPageSetup();
            this.$state.go('config');
        }));
    }
    /////////////////////////////////////////////////////////////////////
    // Configuration page ///////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////
    configPageSetup() {
        this.ui.configPage.allConfigIds = new Array();
        this.ui.configPage.currentSObjectId = undefined;
        this.ui.previewPage.allowShowing = false;
        this.ui.executePage.allowShowing = false;
        this._refreshUI();
    }
    initConfig($scope) {
        $scope.ui.controller.$timeout(() => {
            $scope.ui.configPage.currentSObjectId = undefined;
            $scope.ui.state.config().initialize();
            $scope.ui.controller._refreshUI();
        }, 50);
    }
    configChangedHandler($new, $old, $scope) {
        $scope.ui.controller.initConfig($scope);
    }
    switchOrgsHandler() {
        this._showUILoader();
        let sourceOrg = this.ui.state.sourceOrg();
        let targetOrg = this.ui.state.targetOrg();
        sourceOrg.sourceType = sourceOrg.sourceType == statics_1.SOURCE_TYPE.Source ? statics_1.SOURCE_TYPE.Target : statics_1.SOURCE_TYPE.Source;
        targetOrg.sourceType = targetOrg.sourceType == statics_1.SOURCE_TYPE.Source ? statics_1.SOURCE_TYPE.Target : statics_1.SOURCE_TYPE.Source;
        this.initConfig(this.$scope);
        this._hideUILoader();
    }
    addConfigClickHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            let configName = yield this._showPromptAsync(resources_1.RESOURCES.Config_CreateConfigPrompt, resources_1.RESOURCES.Config_CreateConfigTitle, "");
            if (configName) {
                this._showUILoader();
                let config = new config_1.Config({
                    id: appUtils_1.AppUtils.makeId(),
                    name: configName,
                    userData: this.ui.state.userData
                });
                this.ui.state.userData.configs.push(config);
                yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
                this.ui.configPage.allConfigIds = [config.id];
                this.$scope.$apply(undefined);
            }
        }), null, null, false);
    }
    editConfigClickHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            let configName = yield this._showPromptAsync(resources_1.RESOURCES.Config_EditConfigPrompt, resources_1.RESOURCES.Config_EditConfigTitle, this.ui.state.config().name);
            if (configName) {
                this._showUILoader();
                this.ui.state.config().initialize({
                    name: configName
                });
                yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
                this.$scope.$apply(undefined);
            }
        }), null, null, false);
    }
    cloneConfigClickHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            let configName = yield this._showPromptAsync(resources_1.RESOURCES.Config_CloneConfigPrompt, resources_1.RESOURCES.Config_CloneConfigTitle, this.ui.state.config().name);
            if (configName) {
                this._showUILoader();
                let config = deepClone.deepCloneSync(this.ui.state.config(), {
                    absolute: true,
                });
                config.initialize({
                    id: appUtils_1.AppUtils.makeId(),
                    name: configName,
                    userData: this.ui.state.userData
                });
                this.ui.state.userData.configs.push(config);
                yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
                this.ui.configPage.allConfigIds = [config.id];
                this.$scope.$apply(undefined);
            }
        }), null, null, false);
    }
    uploadConfigChangeHandler(event) {
        let self = this;
        this._readSingleFile(event).then(function (json) {
            self._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
                let config = new config_1.Config({
                    id: appUtils_1.AppUtils.makeId(),
                    name: path.basename(event.target.value).split('.').slice(0, -1).join('.'),
                    userData: self.ui.state.userData
                });
                config.fromExportObjectJson(json);
                self.ui.state.userData.configs.push(config);
                yield dbUtils_1.DbUtils.saveUserAsync(self.ui.state.userData);
                self.ui.configPage.allConfigIds = [config.id];
                self.$scope.$apply(undefined);
                self._refreshUI();
            }));
        });
    }
    downloadConfigClickHandler() {
        this._showUILoader();
        let fileName = this.ui.state.config().exportObjectFilename;
        fs.writeFileSync(fileName, this.ui.state.config().toExportObjectJson());
        this._hideUILoader();
        this._downloadFile(fileName);
    }
    removeConfigClickHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            let confirmed = yield this._showConfirmAsync(null, resources_1.RESOURCES.Config_DeleteConfigTitle);
            if (confirmed) {
                this._showUILoader();
                this.ui.state.configs(appUtils_1.AppUtils.remove(this.ui.state.configs(), this.ui.state.config()));
                yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
                this.ui.configPage.allConfigIds = [];
                this.$scope.$apply(undefined);
            }
        }), null, null, false);
    }
    addObjectsClickHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            if (this.ui.configPage.allSObjectIds.length == 0) {
                return;
            }
            for (let index = 0; index < this.ui.configPage.allSObjectIds.length; index++) {
                const objectName = this.ui.configPage.allSObjectIds[index];
                yield this._describeSObjectAsync(objectName);
                let scriptObject = new scriptObject_1.ScriptObject({
                    config: this.ui.state.config(),
                    fields: [new ScriptObjectField_1.ScriptObjectField({ name: "Id" })],
                    name: objectName
                });
                if (scriptObject.defaultExternalId != "Id") {
                    scriptObject.fields.push(new ScriptObjectField_1.ScriptObjectField({ name: scriptObject.defaultExternalId }));
                }
                scriptObject.externalId = scriptObject.defaultExternalId;
                if (scriptObject.externalId == "Id") {
                    scriptObject.operation = statics_1.OPERATION[statics_1.OPERATION.Insert].toString();
                }
                this.ui.state.config().objects.push(scriptObject);
            }
            yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
            this.ui.configPage.allSObjectIds = [];
            this.$scope.$apply(undefined);
        }));
    }
    selectObjectClickHandler($event) {
        let self = this;
        let isButtonClicked = $event.target.className.indexOf('btn') >= 0
            || $event.target.className.indexOf('custom-control-label') >= 0
            || $event.target.className.indexOf('custom-control-input') >= 0;
        if (this.ui.configPage.currentSObjectId == $event.currentTarget.dataset.id || isButtonClicked) {
            return;
        }
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            this.ui.configPage.currentSObjectId = $event.currentTarget.dataset.id;
            let scriptObject = this.ui.state.config().objects.filter(object => object.name == this.ui.configPage.currentSObjectId)[0];
            if (scriptObject) {
                yield this._describeSObjectAsync(scriptObject.name);
                this.ui.configPage.objectEditData = new helper_classes_1.ObjectEditData({
                    noRecords: true,
                    isOpen: false,
                    oldExternalId: undefined
                });
                this.ui.configPage.isComplexExternalIdEditMode = scriptObject.isComplexExternalId;
                // Workarround to refresh the externalId selector ----
                this._preventExtraEvents();
                let temp = this.ui.externalId;
                this.ui.externalId = ['Dummy'];
                this.$timeout(function () {
                    self._preventExtraEvents();
                    self.ui.externalId = temp;
                }, 200);
                // -------------------------------------------------------
                this._displayDataTable('#testQueryRecordTable', [{}]);
                this._updateFieldItems(scriptObject);
                $(`[data-target="#fields"]`).click();
                this._preventExtraEvents();
            }
            this.$scope.$apply(undefined);
        }));
    }
    addRemoveObjectFieldsHandler($scope, selectedFields, $element) {
        if ($scope.ui.controller._blockAddRemoveObjectFieldsEvent) {
            return;
        }
        this._blockAddRemoveObjectFieldsEvent = true;
        $scope.ui.controller._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            // Add/Remove fields -------------------
            $scope.ui.state.sobject().fields = appUtils_1.AppUtils.distinctArray([].concat(selectedFields, statics_1.CONSTANTS.MANDATORY_FIELDS.map(name => new ScriptObjectField_1.ScriptObjectField({ name }))), "name");
            // Filter other parameters --------------
            let fullQueryFields = $scope.ui.state.sobject().getFullQueryFields();
            // Remove incorect field mappings
            $scope.ui.state.sobject().fieldMapping = $scope.ui.state
                .sobject().fieldMapping.filter(field => fullQueryFields.some(name => name == field.sourceField)
                || !field.sourceField && field.targetObject);
            // Remove incorrect field mocking
            $scope.ui.state.sobject().mockFields = $scope.ui.state
                .sobject().mockFields.filter(field => fullQueryFields.some(name => name == field.name));
            // Save user +++++++++++++++++++++++++++
            $scope.ui.controller._updateFieldItems($scope.ui.state.sobject());
            yield dbUtils_1.DbUtils.saveUserAsync($scope.ui.state.userData);
            this._preventExtraEvents();
            $scope.$apply(undefined);
            this._showUIToast("success", { content: resources_1.RESOURCES.Config_Message_ConfigSucessfullyUpdated, delay: statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS });
        }), null, null, false);
    }
    addRemoveObjectExcludedFieldsHandler($scope, selectedFields, $element) {
        if ($scope.ui.controller._blockRemoveObjectExcludedFieldsEvent) {
            return;
        }
        this._blockRemoveObjectExcludedFieldsEvent = true;
        $scope.ui.controller._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            $scope.ui.state.sobject().excludedFields = selectedFields.map(field => field.name);
            $scope.ui.controller._updateFieldItems($scope.ui.state.sobject());
            yield dbUtils_1.DbUtils.saveUserAsync($scope.ui.state.userData);
            this.objectQueryChangedHandler([], [], $scope);
            this._preventExtraEvents();
            $scope.$apply(undefined);
            this._showUIToast("success", { content: resources_1.RESOURCES.Config_Message_ConfigSucessfullyUpdated, delay: statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS });
        }), null, null, false);
    }
    removeUnusedConfigFoldersHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            let confirmed = yield this._showConfirmAsync(resources_1.RESOURCES.Config_AreYouSureToRemoveUnusedFolders, resources_1.RESOURCES.Config_CleanupDataDirectory);
            if (confirmed) {
                let folders = appUtils_1.AppUtils.getListOfDirs(this.ui.state.userData.basePath);
                let toDelete = folders.filter(folder => {
                    if (!this.ui.state.configs().map(c => c.name).some(x => folder.name == x)) {
                        return !folder.name.startsWith(statics_1.CONSTANTS.WORKING_SUBFOLDER_NAME_PREFIX);
                    }
                }).map(folder => folder.fullPath);
                appUtils_1.AppUtils.deleteDirs(toDelete);
                this._showUIToast("success", {
                    content: resources_1.RESOURCES.Config_Message_UnusedFolderSuccessfullyRemoved
                });
                this.$scope.$apply(undefined);
            }
        }), null, null, false);
    }
    objectQueryChangedHandler($new, $old, $scope) {
        $scope.ui.controller._initObjectEditorDataQuery();
    }
    executeTestQueryHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            this.ui.configPage.objectEditData.error = undefined;
            try {
                if (!this.ui.configPage.objectEditData.query) {
                    this.ui.configPage.objectEditData.query = this.ui.configPage.objectEditData.originalQuery;
                }
                let parsedQuery = this.ui.state.sobject().parseQueryString(this.ui.configPage.objectEditData.query);
                this.ui.configPage.objectEditData.query = soql_parser_js_1.composeQuery(parsedQuery);
                parsedQuery.limit = 1;
                let query = soql_parser_js_1.composeQuery(parsedQuery);
                let org = this.ui.configPage.objectEditData.isSource && this.ui.state.sourceOrg().isOrg() ? this.ui.state.sourceOrg() : this.ui.state.targetOrg();
                let records = (yield appUtils_1.AppUtils.queryAsync(org, query, false)).records;
                let data = [];
                if (records.length > 0) {
                    data = appUtils_1.AppUtils.transposeArrayMany(records, resources_1.RESOURCES.Column_Field, resources_1.RESOURCES.Column_Value);
                    data.forEach(item => item[resources_1.RESOURCES.Column_Value] = item[resources_1.RESOURCES.Column_Value][0]);
                    setTimeout(() => {
                        this._displayDataTable('#testQueryRecordTable', data);
                    }, 300);
                }
                else {
                    data = [];
                }
                this.ui.configPage.objectEditData.noRecords = data.length == 0;
                this.ui.configPage.objectEditData.isOpen = true;
            }
            catch (ex) {
                this.ui.configPage.objectEditData.error = ex.message;
            }
        })).finally(() => this.$scope.$apply(undefined));
    }
    updateSObjectQueryHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            this.ui.configPage.objectEditData.error = undefined;
            try {
                if (!this.ui.configPage.objectEditData.query) {
                    this.ui.configPage.objectEditData.query = this.ui.configPage.objectEditData.originalQuery;
                }
                let scriptObject = this.ui.state.sobject();
                // Parse + fix the query fields (find closest names)
                let parsedQuery = this.ui.state.sobject().parseQueryString(this.ui.configPage.objectEditData.query);
                let composedQuery = soql_parser_js_1.composeQuery(parsedQuery);
                // Fix (upper-case) all soql statemets
                let soqlKeywords = appUtils_1.AppUtils.createSoqlKeywords(composedQuery);
                // Update query in UI
                this.ui.configPage.objectEditData.query = soqlKeywords.query;
                // Add excluded fields
                let fields = [].concat(parsedQuery.fields.map(field => field.field), scriptObject.excludedFields);
                fields = appUtils_1.AppUtils.uniqueArray(fields);
                // Update script object fields
                scriptObject.fields = fields.map(name => {
                    //let name = (<SOQLField>field).rawValue || (<SOQLField>field).field;
                    let descr = scriptObject.sObjectDescribe.fieldsMap.get(name);
                    let label = descr && descr.label || name;
                    return new ScriptObjectField_1.ScriptObjectField({
                        name,
                        label
                    });
                });
                // Set optional query properties (where / limit / order by)
                scriptObject.limit = parsedQuery.limit;
                let parseResult = appUtils_1.AppUtils.parseSoql(soqlKeywords);
                let where = parseResult.filter(item => item.word == 'WHERE')[0];
                let orderBy = parseResult.filter(item => item.word == 'ORDER BY')[0];
                scriptObject.where = where && where.text;
                scriptObject.orderBy = orderBy && orderBy.text;
                // Save script object and user data   
                this._updateFieldItems(scriptObject);
                yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
                this._preventExtraEvents();
                this.$scope.$apply(undefined);
                this._showUIToast("success", { content: resources_1.RESOURCES.Config_Message_ConfigSucessfullyUpdated, delay: statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS });
            }
            catch (ex) {
                this.ui.configPage.objectEditData.error = ex.message;
                this._showUIToast("error", { content: ex.message });
            }
        }), null, null, false);
    }
    saveConfigParameterHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            //this._filterScriptObjectData(this.ui.state.sobject());
            yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
        }), resources_1.RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, false, statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }
    saveConfigParameterDelayedHandler() {
        if (this._saveConfigParameterDelayedTimeout) {
            clearTimeout(this._saveConfigParameterDelayedTimeout);
        }
        this._saveConfigParameterDelayedTimeout = setTimeout(() => {
            this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
                //this._filterScriptObjectData(this.ui.state.sobject());
                yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
            }), resources_1.RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, false, statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
        }, 3000);
    }
    upDownObjectHandler(objectIndex, moveDirection, first, last) {
        if (first && moveDirection < 0 || last && moveDirection > 0) {
            return;
        }
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            let scriptObject = this.ui.state.config().objects.splice(objectIndex, 1)[0];
            this.ui.state.config().objects.splice(objectIndex + moveDirection, 0, scriptObject);
            yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
            this.$scope.$apply(undefined);
        }), resources_1.RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, false, statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }
    removeObjectHandler(objectIndex) {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            this.ui.state.config().objects.splice(objectIndex, 1);
            yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
            this.ui.configPage.currentSObjectId = undefined;
            this.$scope.$apply(undefined);
        }), resources_1.RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, true, statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }
    saveConfigHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
            this.$scope.$apply(undefined);
        }), resources_1.RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, true, statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }
    saveConfigDelayedHandler() {
        if (this._saveConfigDelayedTimeout) {
            clearTimeout(this._saveConfigDelayedTimeout);
        }
        this._saveConfigDelayedTimeout = setTimeout(() => {
            this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
                yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
                this.$scope.$apply(undefined);
            }), resources_1.RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, true, statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
        }, 3000);
    }
    externalIdChangedHandler($new, $old, $scope) {
        if ($new.length == 0
            || $scope.ui.controller._blockExternalIdChangedEvent
            || $scope.ui.configPage.objectEditData.oldExternalId == $new[0]
            || !$scope.ui.state.sobject().isOrgDescribed) {
            return;
        }
        $scope.ui.controller._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            $scope.ui.configPage.objectEditData.oldExternalId = $new[0];
            $scope.ui.state.sobject().externalId = $new[0];
            $scope.ui.controller._updateFieldItems($scope.ui.state.sobject());
            $scope.ui.controller._initObjectEditorDataQuery();
            yield dbUtils_1.DbUtils.saveUserAsync($scope.ui.state.userData);
            $scope.ui.controller._preventExtraEvents();
        }), resources_1.RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, false, statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }
    polymorphicFieldChangedHandler($new, $old, $scope, $element) {
        if (this._blockOnPolymorphicFieldChangedEvent) {
            return;
        }
        this._blockOnPolymorphicFieldChangedEvent = true;
        this._blockAddRemoveObjectFieldsEvent = true;
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            let scriptObject = $scope.ui.state.sobject();
            let fieldName = $element.attr('data-field-name');
            let field = scriptObject.fields.filter(field => field.name == fieldName)[0];
            if (field) {
                if ($new.length > 0) {
                    field.name = field.cleanName + statics_1.CONSTANTS.REFERENCE_FIELD_OBJECT_SEPARATOR + $new[0];
                }
                else {
                    field.name = field.cleanName;
                }
            }
            this._updateFieldItems(scriptObject);
            yield dbUtils_1.DbUtils.saveUserAsync($scope.ui.state.userData);
            this._preventExtraEvents();
            this._showUIToast("success", { content: resources_1.RESOURCES.Config_Message_ConfigSucessfullyUpdated, delay: statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS });
            $scope.$apply(undefined);
        }), null, null, false);
    }
    externalIdEnterModeChangeHandler() {
        this._blockExternalIdChangedEvent = this.ui.configPage.isComplexExternalIdEditMode;
    }
    addFieldMappingHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            this.ui.state.sobject().fieldMapping.push(new scriptMappingItem_1.ScriptMappingItem());
            this._updateFieldItems(this.ui.state.sobject());
            yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
            this.$scope.$apply(undefined);
        }), resources_1.RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, true, statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }
    removeFieldMappingHandler(index) {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            this.ui.state.sobject().fieldMapping.splice(index, 1);
            this._updateFieldItems(this.ui.state.sobject());
            yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
            this.$scope.$apply(undefined);
        }), resources_1.RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, true, statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }
    fieldMappingChangedHandler(options, field) {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            if (typeof options.id != 'undefined') {
                options.id = parseInt(options.id);
                this.ui.state.sobject().fieldMapping[options.id][field] = options.value;
                if (field == 'targetObject' && options.value) {
                    yield this._describeSObjectAsync(options.value);
                    this._hideUILoader();
                }
                this._updateFieldItems(this.ui.state.sobject());
                yield dbUtils_1.DbUtils.saveUserAsync(this.ui.state.userData);
                this.$scope.$apply(undefined);
            }
        }), resources_1.RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, true, statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }
    fieldMappingInitializeHandler(options) {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            if (typeof options.id != 'undefined') {
                options.id = parseInt(options.id);
                if (options.id == 0) {
                    if (options.value) {
                        yield this._describeSObjectAsync(options.value);
                        this._hideUILoader();
                    }
                    this._updateFieldItems(this.ui.state.sobject());
                    this.$scope.$apply(undefined);
                }
            }
        }), null, null, false);
    }
    validateConfigurationHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            this._showUILoader(resources_1.RESOURCES.Config_ValidateConfigurationStarted);
            yield appUtils_1.AppUtils.sleepAsync(1500);
            yield this._validateConfigurationAsync();
            this._preventExtraEvents();
            if (this.ui.configPage.isValid()) {
                this._showUIToast("success", { content: resources_1.RESOURCES.Config_ValidateConfigurationSucceeded });
            }
            else {
                this._showUIToast("warning", { title: resources_1.RESOURCES.DefaultToastWarningTitle, content: resources_1.RESOURCES.Config_ValidateConfigurationFailed });
            }
            this.$scope.$apply(undefined);
        }), null, null, false);
    }
    reconnectOrgsHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            yield this._connectOrgsAsync();
            this.ui.configPage.currentSObjectId = undefined;
            this.$scope.$apply(undefined);
        }));
    }
    configGoNext() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            this._showUILoader(resources_1.RESOURCES.Config_ValidateConfigurationStarted);
            yield appUtils_1.AppUtils.sleepAsync(1500);
            yield this._validateConfigurationAsync();
            this._preventExtraEvents();
            if (this.ui.configPage.isValid()) {
                this._showUIToast("success", { content: resources_1.RESOURCES.Config_ValidateConfigurationSucceeded });
                this.$state.go('preview');
                this.ui.previewPage.allowShowing = true;
                this.previewPageSetup();
            }
            else {
                this._showUIToast("warning", { title: resources_1.RESOURCES.DefaultToastWarningTitle, content: resources_1.RESOURCES.Config_ValidateConfigurationFailed });
            }
            this.$scope.$apply(undefined);
        }), null, null, false);
    }
    addMockingItemHandler() {
        this.ui.state.sobject().mockFields.push(new scriptMockField_1.ScriptMockField({
            name: this.ui.configPage.selectedFieldNameForMock,
            pattern: statics_1.CONSTANTS.DEFAULT_MOCK_PATTERN
        }));
        this._updateFieldItems(this.ui.state.sobject());
        this.saveConfigParameterHandler();
    }
    removeMockingItemHandler(index) {
        this.ui.state.sobject().mockFields.splice(index, 1);
        this._updateFieldItems(this.ui.state.sobject());
        this.saveConfigParameterHandler();
    }
    /////////////////////////////////////////////////////////////////////
    // Preview Page /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    previewPageSetup() {
        this.ui.previewPage.selectedMigrationDirection =
            this.ui.state.sourceOrg().media == statics_1.DATA_MEDIA_TYPE.File ? statics_1.MIGRATION_DIRECTION[statics_1.MIGRATION_DIRECTION.File2Org]
                : this.ui.state.targetOrg().media == statics_1.DATA_MEDIA_TYPE.File ? statics_1.MIGRATION_DIRECTION[statics_1.MIGRATION_DIRECTION.Org2File]
                    : statics_1.MIGRATION_DIRECTION[statics_1.MIGRATION_DIRECTION.Orgs];
        this._generateExportJson();
    }
    generateExportJsonHandler() {
        this._generateExportJson();
    }
    copyCLICommandStringToClipboardHandler() {
        let self = this;
        this.$copyToClipboard.copy(this.ui.previewPage.getCLICommandString()).then(function () {
            self._showUIToast('success', {
                content: resources_1.RESOURCES.Preview_CLICommandCopiedMessage,
                delay: statics_1.CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS
            });
        });
    }
    previewGoNext() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            let self = this;
            let command = this.ui.previewPage.getCLICommandString();
            this.ui.executePage.allowShowing = true;
            this.ui.state.scriptIsExecuting = true;
            this.ui.executePage.executeLogHtml = "";
            let executeLogPlain = "";
            self.$scope.$apply(undefined);
            this.$state.go('execute');
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield consoleUtils_1.ConsoleUtils.callConsoleCommand(command, (data) => {
                    switch (data.type) {
                        case statics_1.CONSOLE_COMMAND_EVENT_TYPE.Close:
                            ___printLog(`<br/><br/>${resources_1.RESOURCES.Execute_Message_ExecuteFinishedWithCode} ${data.exitCode}`, true);
                            break;
                        case statics_1.CONSOLE_COMMAND_EVENT_TYPE.Error:
                            ___printLog("", true);
                            break;
                        case statics_1.CONSOLE_COMMAND_EVENT_TYPE.Exit:
                            ___printLog(`<br/><br/>${resources_1.RESOURCES.Execute_Message_ExecuteFinishedWithCode} ${data.exitCode}`, true);
                            break;
                        case statics_1.CONSOLE_COMMAND_EVENT_TYPE.Start:
                            ___printLog(`<br/><b class='text-secondary'>${command}</b><br/>`);
                            break;
                        case statics_1.CONSOLE_COMMAND_EVENT_TYPE.StdErrData:
                            ___printLog("<span style='color:red'>" + data.message.toString().replace(/\n/g, '<br/>') + '</span>');
                            break;
                        case statics_1.CONSOLE_COMMAND_EVENT_TYPE.StdOutData:
                            ___printLog(data.message.toString().replace(/\n/g, '<br/>'));
                            break;
                    }
                    return false;
                });
            }), 500);
            // ------------- Local function ------------------- //
            function ___printLog(message, stopExecuting = false) {
                executeLogPlain += message;
                self.ui.executePage.executeLogHtml = self._trustHtml(executeLogPlain);
                self.ui.state.scriptIsExecuting = !stopExecuting;
                self.$scope.$apply(undefined);
                $(".execute-page-section").animate({ scrollTop: $(".execute-page-section").prop("scrollHeight") }, 100);
            }
        }), null, null, false);
    }
    /////////////////////////////////////////////////////////////////////
    // Execute Page /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    abortExecutionHandler() {
        this._execAsyncSync(() => __awaiter(this, void 0, void 0, function* () {
            if (this.ui.state.scriptIsExecuting) {
                let confirmed = yield this._showConfirmAsync(null, resources_1.RESOURCES.Execute_AreYouSureToAbortExecution);
                if (confirmed) {
                    consoleUtils_1.ConsoleUtils.killRunningConsoleProcess();
                    this.ui.state.scriptIsExecuting = false;
                    this.$scope.$apply(undefined);
                }
            }
        }), null, null, false);
    }
    // Loader **************************************************
    _uILoader(show, message) {
        if (show) {
            $('.ajax-loader, .ajax-load-message').removeClass('hidden');
            $('.ajax-load-message > span').text(message);
        }
        else {
            $('.ajax-loader, .ajax-load-message').addClass('hidden');
        }
    }
    _showUILoader(message) {
        this._uILoader(true, message || resources_1.RESOURCES.Loader_DefaultLoaderMessage);
    }
    _hideUILoader() {
        setTimeout(() => {
            this._uILoader();
        }, 200);
    }
    // Toast **************************************************        
    _showUIToast(type = statics_1.CONSTANTS.DEFAULT_TOAST_TYPE, options) {
        $.toastDefaults = {
            position: 'top-center',
            dismissible: false,
            stackable: true,
            pauseDelayOnHover: true,
            style: {
                toast: 'toast-element'
            }
        };
        $.toast({
            type,
            title: options.title || resources_1.RESOURCES.DefaultToastTitle,
            content: options.content || resources_1.RESOURCES.DefaultToastMessage,
            delay: options.delay || statics_1.CONSTANTS.UI_TOAST_TIMEOUT_MS
        });
    }
    // Modal dialogs **************************************************        
    _showPromptAsync(message, title, defaultValue) {
        return new Promise(resolve => {
            title = title || resources_1.RESOURCES.DefaultModalTitlePrompt;
            message = message || resources_1.RESOURCES.DefaultModalMessagePrompt;
            this.bootbox.prompt({
                title,
                message,
                value: defaultValue,
                backdrop: true,
                callback: function (value) {
                    if (value == null)
                        resolve(undefined);
                    else
                        resolve(value);
                }
            });
        });
    }
    _showConfirmAsync(message, title) {
        return new Promise(resolve => {
            message = message || resources_1.RESOURCES.DefaultModalMessageConfirm;
            title = title || resources_1.RESOURCES.DefaultModalTitleConfirm;
            this.bootbox.confirm({
                title,
                message,
                backdrop: true,
                callback: function (value) {
                    if (value != "")
                        resolve(true);
                    else
                        resolve(undefined);
                }
            });
        });
    }
    // Others **************************************************    
    // Methods ------------ //
    _preventExtraEvents() {
        this._blockAddRemoveObjectFieldsEvent = true;
        this._blockRemoveObjectExcludedFieldsEvent = true;
        this._blockOnPolymorphicFieldChangedEvent = true;
        this._blockExternalIdChangedEvent = true;
        setTimeout(() => {
            this._blockAddRemoveObjectFieldsEvent = false;
            this._blockRemoveObjectExcludedFieldsEvent = false;
            this._blockOnPolymorphicFieldChangedEvent = false;
            this._blockExternalIdChangedEvent = false;
        }, 500);
    }
    _execAsyncSync(fn, successMessage, errorMessage, showLoader = true, toastDelayMs = undefined) {
        let self = this;
        if (showLoader) {
            this._showUILoader();
        }
        return new Promise((resolve, reject) => {
            appUtils_1.AppUtils.execAsyncSync(() => __awaiter(this, void 0, void 0, function* () { return fn(); })).then((result) => {
                if (successMessage) {
                    self._showUIToast('success', {
                        title: resources_1.RESOURCES.DefaultToastMessage,
                        content: successMessage,
                        delay: toastDelayMs
                    });
                }
                resolve(result);
            }).catch((err) => {
                if (typeof err == 'string') {
                    err = {
                        message: err
                    };
                }
                self._showUIToast('error', {
                    title: resources_1.RESOURCES.DefaultToastErrorTitle,
                    content: errorMessage || err.message || resources_1.RESOURCES.DefaultToastErrorMessage,
                    delay: toastDelayMs
                });
                reject(err);
            }).finally(() => {
                this._hideUILoader();
                this._refreshUI();
            });
        });
    }
    _refreshUI() {
        let self = this;
        this.$timeout(function () {
            $('[data-toggle="tooltip"]').tooltip('dispose');
            $('[data-toggle="tooltip"]').tooltip();
            $('[data-config-selector],[data-org-selector1],[data-org-selector2],[data-config-sobjects-selector],[data-config-externalid-selector]').selectpicker('refresh');
            $('.btn-switch:contains("Off")').addClass('.switch-off').attr('style', 'background-color: #FFF !important;    color: #495057 !important;    border: none !important;');
            self._addBsSelectWatcher("[data-config-externalid-selector]", self.externalIdChangedHandler);
        }, 500);
    }
    _addWhatcher(propertyName, handler) {
        this.$scope.$watch(propertyName, ($new, $old, $scope) => {
            if (!appUtils_1.AppUtils.isEquals($old, $new) && handler) {
                handler($new, $old, $scope);
            }
        });
    }
    _addBsSelectWatcher(selector, handler) {
        let self = this;
        $(selector).off('changed.bs.select').on('changed.bs.select', function (e) {
            let $new = [];
            for (let opt of e.target.selectedOptions) {
                $new.push(opt.value);
            }
            handler($new, [], self.$scope);
        });
    }
    _downloadFile(filePath) {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8').trim();
            const element = document.createElement("a");
            const type = mime_types_1.default.lookup(filePath);
            const file = new Blob([content], { type: String(type) });
            element.href = URL.createObjectURL(file);
            element.download = path.basename(filePath);
            element.click();
        }
    }
    _readSingleFile(e) {
        var deffered = jQuery.Deferred();
        var file = e.target.files[0];
        if (!file) {
            deffered.resolve();
            return;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
            var contents = e.target.result;
            deffered.resolve(contents);
        };
        reader.readAsText(file);
        return deffered.promise();
    }
    _describeSObjectAsync(objectName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.ui.state.sourceOrg().isOrg()) {
                let object = this.ui.state.sourceOrg().objectsMap.get(objectName);
                if (object) {
                    if (!object.isValid()) {
                        // Describe Source...
                        this._showUILoader(resources_1.RESOURCES.Config_DescribingSObject.format(objectName, resources_1.RESOURCES.Source));
                        yield appUtils_1.AppUtils.describeSObjectAsync(this.ui.state.sourceOrg(), objectName, object);
                    }
                }
            }
            if (this.ui.state.targetOrg().isOrg()) {
                let object = this.ui.state.targetOrg().objectsMap.get(objectName);
                if (object) {
                    if (!object.isValid()) {
                        // Describe Target...
                        this._showUILoader(resources_1.RESOURCES.Config_DescribingSObject.format(objectName, resources_1.RESOURCES.Target));
                        yield appUtils_1.AppUtils.describeSObjectAsync(this.ui.state.targetOrg(), objectName, object);
                    }
                }
            }
        });
    }
    _initObjectEditorDataQuery() {
        this.ui.configPage.objectEditData.originalQuery = this.ui.state.sobject().getTestQuery(null);
        this.ui.configPage.objectEditData.query = this.ui.state.sobject().getTestQuery(null);
    }
    _displayDataTable(selector, data, columnsMap) {
        if (!data || data.length == 0) {
            return;
        }
        let columns = Object.keys(data[0]).map(key => {
            return {
                field: key,
                title: columnsMap && columnsMap.get(key) || key
            };
        });
        $(selector).bootstrapTable('destroy');
        $(selector).bootstrapTable({
            columns,
            data,
            classes: 'table table-hover table-striped data-table'
        });
    }
    _textToHtml(text) {
        return this._trustHtml(appUtils_1.AppUtils.textToHtmlString(text));
    }
    _trustHtml(html) {
        return this.$sce.trustAsHtml(html);
    }
    _updateFieldItems(scriptObject) {
        scriptObject.updateFieldItems();
        this.ui.configPage.updateFieldItems();
        this.ui.configPage.selectedFieldNameForMock = scriptObject.availableFieldItemsForMocking[0]
            && scriptObject.availableFieldItemsForMocking[0].name;
    }
    _validateConfigurationAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let index = 0; index < this.ui.state.config().objects.length; index++) {
                const scriptObject = this.ui.state.config().objects[index];
                yield this._describeSObjectAsync(scriptObject.name);
                this._updateFieldItems(scriptObject);
            }
        });
    }
    _connectOrgsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            // Connect to Source
            if (this.ui.state.sourceOrg().isOrg()) {
                try {
                    this._showUILoader(resources_1.RESOURCES.Home_Message_ConnectingOrg.format(resources_1.RESOURCES.Source));
                    yield appUtils_1.AppUtils.connectOrg(this.ui.state.sourceOrg());
                }
                catch (ex) {
                    throw new Error(resources_1.RESOURCES.Home_Error_UnableToConnectToOrg.format(resources_1.RESOURCES.Source));
                }
            }
            // Connect to Target
            if (this.ui.state.targetOrg().isOrg()) {
                try {
                    this._showUILoader(resources_1.RESOURCES.Home_Message_ConnectingOrg.format(resources_1.RESOURCES.Target));
                    yield appUtils_1.AppUtils.connectOrg(this.ui.state.targetOrg());
                }
                catch (ex) {
                    throw new Error(resources_1.RESOURCES.Home_Error_UnableToConnectToOrg.format(resources_1.RESOURCES.Target));
                }
            }
            // Reading the Source objects list
            if (this.ui.state.sourceOrg().isOrg()) {
                try {
                    this._showUILoader(resources_1.RESOURCES.Home_Message_RetrievingOrgMetadata.format(resources_1.RESOURCES.Source));
                    let objects = yield appUtils_1.AppUtils.getOrgObjectsList(this.ui.state.sourceOrg());
                    this.ui.state.sourceOrg().objectsMap.clear();
                    objects.forEach(obj => {
                        this.ui.state.sourceOrg().objectsMap.set(obj.name, obj);
                    });
                }
                catch (ex) {
                    throw new Error(resources_1.RESOURCES.Home_Error_UnableToRetrieveMetadata.format(resources_1.RESOURCES.Source));
                }
            }
            // Reading the Target objects list
            if (this.ui.state.targetOrg().isOrg()) {
                try {
                    this._showUILoader(resources_1.RESOURCES.Home_Message_RetrievingOrgMetadata.format(resources_1.RESOURCES.Target));
                    let objects = yield appUtils_1.AppUtils.getOrgObjectsList(this.ui.state.targetOrg());
                    this.ui.state.targetOrg().objectsMap.clear();
                    objects.forEach(obj => {
                        this.ui.state.targetOrg().objectsMap.set(obj.name, obj);
                    });
                }
                catch (ex) {
                    throw new Error(resources_1.RESOURCES.Home_Error_UnableToRetrieveMetadata.format(resources_1.RESOURCES.Target));
                }
            }
            this._showUIToast('success', { content: resources_1.RESOURCES.Home_Message_MetadataRetrieveSuccess });
        });
    }
    _generateExportJson() {
        this.ui.previewPage.exportJson =
            this.ui.previewPage.isFullExportJson
                ? this.ui.state.config().toExportJson(this.ui, appUIState_1.AppUIState.appSettings.isDebug, statics_1.CONSTANTS.EXPORT_JSON_FULL_TAG) :
                this.ui.state.config().toExportJson(this.ui, appUIState_1.AppUIState.appSettings.isDebug, statics_1.CONSTANTS.EXPORT_JSON_TAG);
        try {
            fs.writeFileSync(this.ui.state.config().exportJsonFilename, this.ui.previewPage.exportJson);
        }
        catch (ex) { }
    }
    _displayNewVersionMessage() {
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            yield this.ui.state.setNewVersionMessage();
            this.$scope.$apply(undefined);
        }));
    }
}
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map