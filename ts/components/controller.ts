/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as deepClone from 'deep.clone';
import jq, { data } from 'jquery';
import mime from 'mime-types';
import { AppUIState } from './appUIState';
import { AppUtils } from './appUtils';
import { composeQuery, Field as SOQLField } from 'soql-parser-js';
import { Config } from '../models/config';
import {
    CONSTANTS,
    DATA_MEDIA_TYPE,
    MIGRATION_DIRECTION,
    OPERATION,
    SOURCE_TYPE,
    CONSOLE_COMMAND_EVENT_TYPE
} from './statics';
import { DbUtils } from './dbUtils';
import { FieldItem } from '../models/fieldItem';
import { Form } from '../models/form';
import { IAngularScope } from './helper_interfaces';
import { ObjectEditData } from './helper_classes';
import { Org } from '../models/org';
import { RESOURCES } from './resources';
import { ScriptMappingItem } from '../models/scriptMappingItem';
import { ScriptObject } from '../models/scriptObject';
import { ScriptObjectField } from '../models/ScriptObjectField';
import { UserDataWrapper } from '../models/userDataWrapper';
import fs = require('fs');
import path = require('path');
import { ConsoleUtils } from './consoleUtils';
import { ScriptMockField } from '../models/scriptMockField';
const $ = <any>jq;


export class Controller {

    ////////////////////////////////////////////////////////////
    // Declarations ////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    // ---------   //
    $copyToClipboard: any;
    $scope: IAngularScope;
    $rootScope: any;
    $http: any;
    $timeout: any;
    $window: any;
    $q: any;
    $sce: any;

    // ---------    //
    $state: {
        go: (page: string) => any
    };

    bootbox: {
        confirm: Function,
        prompt: Function
    }

    get ui(): AppUIState {
        return this.$scope.ui;
    }

    // ---------   //
    constructor(controllerData: any) {
        AppUtils.objectApply(this, controllerData);
    }




    ////////////////////////////////////////////////////////////
    // Common //////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////

    init() {
        // Setup controller //////
        this.controllerSetup(true);
    }

    controllerSetup(isInitialSetup?: boolean) {
        let self = this;

        // Each-time setup ////////
        this.$scope.ui = new AppUIState(this);
        this.$scope.res = RESOURCES;

        // Initial setup only ///////
        if (isInitialSetup) {
            // Setup window object              
            document.title = AppUIState.appSettings.app_title;
            this.bootbox = this.$window["bootbox"];

            // Setup watchers
            this._addWhatcher("ui.state.sobject().query", this.objectQueryChangedHandler);
            this._addWhatcher("ui.homePage.currentSourceOrgIds", this.orgChangedHandler);
            this._addWhatcher("ui.homePage.currentTargetOrgIds", this.orgChangedHandler);
            this._addWhatcher("ui.configPage.allConfigIds", this.configChangedHandler);

            this.$rootScope.$on('$stateChangeStart', function (event: any,
                toState: any, toParams: any,
                fromState: any) {

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
            AppUtils.execAsyncSync(async () => {
                $('#wrapper').removeClass('hidden');
                this.$state.go('login');
                this._refreshUI();
            }, 50);
        }
    }

    switchStateHandler(state: string) {
        this.$state.go(state);
    }

    openBasePathInExplorerHandler() {
        AppUtils.openExplorer(this.ui.state.userData.basePath);
    }

    openConfigInExplorerHandler() {
        if (fs.existsSync(this.ui.state.config().exportJsonFilepath))
            AppUtils.openExplorer(this.ui.state.config().exportJsonFilepath);
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
            this._execAsyncSync(async () => {
                let u = await DbUtils.findAndLoadUserDataAsync(this.ui.loginPage.form.email, this.ui.loginPage.form.password);
                if (u) {
                    this.ui.state.userData = new UserDataWrapper().fromSecuredObject(u, this.ui.loginPage.form.password);
                    await DbUtils.compactDbAsync();
                    this.$state.go('home');
                    this._refreshUI();
                } else {
                    this.$scope.$apply(() => this.ui.loginPage.form.invalid = true);
                }
            });
        }
    }

    logOffHandler() {
        this.ui.state.userData = undefined;
        this.ui.loginPage.form = new Form();
        this.ui.registerPage.form = new Form();
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
            this._execAsyncSync(async () => {
                let u = await DbUtils.findAndLoadUserDataAsync(this.ui.registerPage.form.email, this.ui.registerPage.form.password);
                if (u) {
                    this.$scope.$apply(() => this.ui.registerPage.form.invalid = true);
                    return;
                }
                this.ui.state.userData = new UserDataWrapper({
                    plainEmail: this.ui.registerPage.form.email,
                    plainPassword: this.ui.registerPage.form.password
                });
                await DbUtils.insertUserAsync(this.ui.state.userData);
                await DbUtils.compactDbAsync();

                // Go next page
                this.$state.go('home');

            });
        }
    }





    /////////////////////////////////////////////////////////////////////
    // Profile page ///////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////

    profilePageSetup() {
        this.ui.profilePage.form = new Form({
            email: this.ui.state.userData.plainEmail,
            password: this.ui.state.userData.plainPassword
        });
        AppUtils.objectAssignSafe(this.ui.profilePage.settingsForm, AppUIState.appSettings);
        this._refreshUI();
    }

    saveEmailAndPasswordHandler() {
        if (this.ui.profilePage.form.isValid()) {
            this._execAsyncSync(async () => {
                let u = this.ui.profilePage.form.email != this.ui.state.userData.plainEmail
                    && await DbUtils.findAndLoadUserDataAsync(this.ui.profilePage.form.email, this.ui.profilePage.form.password);
                if (u) {
                    this.$scope.$apply(() => this.ui.profilePage.form.invalid = true);
                    return;
                }
                this.ui.state.userData.plainEmail = this.ui.profilePage.form.email;
                this.ui.state.userData.plainPassword = this.ui.profilePage.form.password;
                await DbUtils.saveUserAsync(this.ui.state.userData);
                this.ui.profilePage.form.invalid = false;
                this.$scope.$apply(undefined);
                this._showUIToast("success", {
                    content: RESOURCES.Profile_UserProfileSaved
                });
            });
        }
    }

    openChangeBasePathDialogHandler() {
        let newPaths = AppUtils.selectFolder(AppUIState.appSettings.db_basePath);
        this.ui.profilePage.settingsForm.db_basePath = newPaths && newPaths[0] || this.ui.profilePage.settingsForm.db_basePath;
    }

    saveApplicationSettingsHandler() {
        this._execAsyncSync(async () => {
            AppUtils.writeUserJson(this.ui.profilePage.settingsForm);
            AppUtils.objectAssignSafe(AppUIState.appSettings, this.ui.profilePage.settingsForm);
            if (DbUtils.getDbFilePath() != this.ui.profilePage.settingsForm.db_basePath // Path is changed
                || DbUtils.getDbFilenameWithoutPath() != this.ui.profilePage.settingsForm.db_name /*Name is changed*/) {
                await DbUtils.moveDbAsync(this.ui.profilePage.settingsForm.db_moveFiles);
            }
            this._refreshUI();
            this._showUIToast("success", {
                content: RESOURCES.Profile_UserProfileSaved
            });
        });
    }





    /////////////////////////////////////////////////////////////////////
    // Home (connection) page ///////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////

    homePageSetup() {
        this._refreshUI();
    }

    orgChangedHandler($new: Array<string>, $old: Array<string>, $scope: IAngularScope) {
        $scope.ui.state.setSourceTargetOrgs();
    }

    refreshOrgsListHandler() {
        this._execAsyncSync(async () => {
            this._showUILoader(RESOURCES.Home_Message_ReadingOrgList);
            let orgList = await AppUtils.execForceOrgList();
            if (orgList.orgs.length == 0) {
                this._showUIToast("warning", {
                    title: RESOURCES.DefaultToastWarningTitle,
                    content: RESOURCES.Home_Message_NoSFDXOrgsDetected
                });
            }
            this.ui.state.userData.orgs = [].concat(orgList.orgs.map(org => {
                return new Org({
                    instanceUrl: org.instanceUrl,
                    orgId: org.orgId,
                    orgName: org.username,
                    name: org.username,
                    alias: org.alias,
                    media: DATA_MEDIA_TYPE.Org
                })
            }), this.ui.state.userData.orgs.filter(org => org.orgName == CONSTANTS.CSV_FILES_SOURCENAME));

            await DbUtils.saveUserAsync(this.ui.state.userData);
            this.$scope.$apply(undefined);
        });
    }

    executeForceOrgListHandler() {
        this._execAsyncSync(async () => {
            this._showUILoader(RESOURCES.Home_Message_ExecutingForceOrgList);
            let result = await AppUtils.execForceOrgList();
            this.ui.homePage.cliOutputPlain = result.commandOutput;
            this.ui.homePage.cliOutput = this._textToHtml(result.commandOutput);
            this.$scope.$apply(undefined);
        });
    }

    executeForceOrgDisplayHandler() {
        this._execAsyncSync(async () => {
            let commandOutputArr = [];
            if (this.ui.state.sourceOrg().isOrg()) {
                this._showUILoader(RESOURCES.Home_Message_ExecutingForceOrgDisplay.format(this.ui.state.sourceOrg().name));
                commandOutputArr.push((await AppUtils.execForceOrgDisplay(this.ui.state.sourceOrg().name, true)).commandOutput.trim());
            }
            if (this.ui.state.targetOrg().isOrg()) {
                this._showUILoader(RESOURCES.Home_Message_ExecutingForceOrgDisplay.format(this.ui.state.targetOrg().name));
                commandOutputArr.push((await AppUtils.execForceOrgDisplay(this.ui.state.targetOrg().name, true)).commandOutput.trim());
            }
            let commandOutput = "";
            if (commandOutputArr.length > 0) {
                commandOutput = `[${commandOutputArr.join(',')}]`;
                commandOutput = AppUtils.pretifyJson(commandOutput);
            } else {
                commandOutput = RESOURCES.Home_Message_SelectSourceOrTarget;
            }
            this.ui.homePage.cliOutputPlain = commandOutput;
            this.ui.homePage.cliOutput = this._textToHtml(commandOutput);
            this.$scope.$apply(undefined);
        });
    }

    downloadCLICommadOutputHandler() {
        this._showUILoader();
        let fileName = this.ui.state.userData.cliCommadOutputFilename;
        fs.writeFileSync(fileName, this.ui.homePage.cliOutputPlain);
        this._hideUILoader();
        this._downloadFile(fileName);
    }

    homeGoNext() {

        this._execAsyncSync(async () => {

            // Set Source/Target orgs
            this.ui.state.setSourceTargetOrgs();
            await this._connectOrgsAsync();

            // Go next page
            this.configPageSetup();
            this.$state.go('config');
        });
    }





    /////////////////////////////////////////////////////////////////////
    // Configuration page ///////////////////////////////////////////////    
    /////////////////////////////////////////////////////////////////////

    configPageSetup() {
        this.ui.configPage.allConfigIds = new Array<string>();
        this.ui.configPage.currentSObjectId = undefined;
        this.ui.previewPage.allowShowing = false;
        this.ui.executePage.allowShowing = false;
        this._refreshUI();
    }

    initConfig($scope: IAngularScope) {
        $scope.ui.controller.$timeout(() => {
            $scope.ui.configPage.currentSObjectId = undefined;
            $scope.ui.state.config().initialize();
            $scope.ui.controller._refreshUI();
        }, 50);
    }

    configChangedHandler($new: Array<string>, $old: Array<string>, $scope: IAngularScope) {
        $scope.ui.controller.initConfig($scope);
    }

    switchOrgsHandler() {
        this._showUILoader();
        let sourceOrg = this.ui.state.sourceOrg();
        let targetOrg = this.ui.state.targetOrg();
        sourceOrg.sourceType = sourceOrg.sourceType == SOURCE_TYPE.Source ? SOURCE_TYPE.Target : SOURCE_TYPE.Source;
        targetOrg.sourceType = targetOrg.sourceType == SOURCE_TYPE.Source ? SOURCE_TYPE.Target : SOURCE_TYPE.Source;
        this.initConfig(this.$scope);
        this._hideUILoader();
    }

    addConfigClickHandler() {
        this._execAsyncSync(async () => {
            let configName = await this._showPromptAsync(RESOURCES.Config_CreateConfigPrompt, RESOURCES.Config_CreateConfigTitle, "");
            if (configName) {
                this._showUILoader();
                let config = new Config({
                    id: AppUtils.makeId(),
                    name: configName,
                    userData: this.ui.state.userData
                });
                this.ui.state.userData.configs.push(config);
                await DbUtils.saveUserAsync(this.ui.state.userData);
                this.ui.configPage.allConfigIds = [config.id];
                this.$scope.$apply(undefined);
            }
        }, null, null, false);
    }

    editConfigClickHandler() {
        this._execAsyncSync(async () => {
            let configName = await this._showPromptAsync(RESOURCES.Config_EditConfigPrompt, RESOURCES.Config_EditConfigTitle, this.ui.state.config().name);
            if (configName) {
                this._showUILoader();
                this.ui.state.config().initialize({
                    name: configName
                });
                await DbUtils.saveUserAsync(this.ui.state.userData);
                this.$scope.$apply(undefined);
            }
        }, null, null, false);
    }

    cloneConfigClickHandler() {
        this._execAsyncSync(async () => {
            let configName = await this._showPromptAsync(RESOURCES.Config_CloneConfigPrompt, RESOURCES.Config_CloneConfigTitle, this.ui.state.config().name);
            if (configName) {
                this._showUILoader();
                let config = deepClone.deepCloneSync(this.ui.state.config(), {
                    absolute: true,
                });
                config.initialize({
                    id: AppUtils.makeId(),
                    name: configName,
                    userData: this.ui.state.userData
                })
                this.ui.state.userData.configs.push(config);
                await DbUtils.saveUserAsync(this.ui.state.userData);
                this.ui.configPage.allConfigIds = [config.id];
                this.$scope.$apply(undefined);
            }
        }, null, null, false);
    }

    uploadConfigChangeHandler(event: any) {
        let self = this;
        this._readSingleFile(event).then(function (json) {
            self._execAsyncSync(async () => {
                let config = new Config({
                    id: AppUtils.makeId(),
                    name: path.basename(event.target.value).split('.').slice(0, -1).join('.'),
                    userData: self.ui.state.userData
                });
                config.fromExportObjectJson(json);
                self.ui.state.userData.configs.push(config);
                await DbUtils.saveUserAsync(self.ui.state.userData);
                self.ui.configPage.allConfigIds = [config.id];
                self.$scope.$apply(undefined);
                self._refreshUI();
            });
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
        this._execAsyncSync(async () => {
            let confirmed = await this._showConfirmAsync(null, RESOURCES.Config_DeleteConfigTitle);
            if (confirmed) {
                this._showUILoader();
                this.ui.state.configs(AppUtils.remove(this.ui.state.configs(), this.ui.state.config()));
                await DbUtils.saveUserAsync(this.ui.state.userData);
                this.ui.configPage.allConfigIds = [];
                this.$scope.$apply(undefined);
            }
        }, null, null, false);
    }

    addObjectsClickHandler() {
        this._execAsyncSync(async () => {
            if (this.ui.configPage.allSObjectIds.length == 0) {
                return;
            }
            for (let index = 0; index < this.ui.configPage.allSObjectIds.length; index++) {
                const objectName = this.ui.configPage.allSObjectIds[index];
                await this._describeSObjectAsync(objectName);
                let scriptObject = new ScriptObject({
                    config: this.ui.state.config(),
                    fields: [new ScriptObjectField({ name: "Id" })],
                    name: objectName
                });
                if (scriptObject.defaultExternalId != "Id") {
                    scriptObject.fields.push(new ScriptObjectField({ name: scriptObject.defaultExternalId }));
                }
                scriptObject.externalId = scriptObject.defaultExternalId;
                if (scriptObject.externalId == "Id") {
                    scriptObject.operation = OPERATION[OPERATION.Insert].toString();
                }
                this.ui.state.config().objects.push(scriptObject);
            }
            await DbUtils.saveUserAsync(this.ui.state.userData);
            this.ui.configPage.allSObjectIds = [];
            this.$scope.$apply(undefined);
        });

    }

    selectObjectClickHandler($event: any) {
        let self = this;
        let isButtonClicked = $event.target.className.indexOf('btn') >= 0
            || $event.target.className.indexOf('custom-control-label') >= 0
            || $event.target.className.indexOf('custom-control-input') >= 0;
        if (this.ui.configPage.currentSObjectId == $event.currentTarget.dataset.id || isButtonClicked) {
            return;
        }
        this._execAsyncSync(async () => {
            this.ui.configPage.currentSObjectId = $event.currentTarget.dataset.id;
            let scriptObject = this.ui.state.config().objects.filter(object => object.name == this.ui.configPage.currentSObjectId)[0];
            if (scriptObject) {
                await this._describeSObjectAsync(scriptObject.name);
                this.ui.configPage.objectEditData = new ObjectEditData({
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
        });
    }

    addRemoveObjectFieldsHandler($scope: IAngularScope, selectedFields: Array<ScriptObjectField>, $element: JQuery) {
        if ($scope.ui.controller._blockAddRemoveObjectFieldsEvent) {
            return;
        }
        this._blockAddRemoveObjectFieldsEvent = true;
        $scope.ui.controller._execAsyncSync(async () => {

            // Add/Remove fields -------------------
            $scope.ui.state.sobject().fields = AppUtils.distinctArray([].concat(
                selectedFields,
                CONSTANTS.MANDATORY_FIELDS.map(name => new ScriptObjectField({ name }))
            ), "name");

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
            await DbUtils.saveUserAsync($scope.ui.state.userData);
            this._preventExtraEvents();
            $scope.$apply(undefined);
            this._showUIToast("success", { content: RESOURCES.Config_Message_ConfigSucessfullyUpdated, delay: CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS });
        }, null, null, false);
    }

    addRemoveObjectExcludedFieldsHandler($scope: IAngularScope, selectedFields: Array<FieldItem>, $element: JQuery) {
        if ($scope.ui.controller._blockRemoveObjectExcludedFieldsEvent) {
            return;
        }
        this._blockRemoveObjectExcludedFieldsEvent = true;
        $scope.ui.controller._execAsyncSync(async () => {
            $scope.ui.state.sobject().excludedFields = selectedFields.map(field => field.name);
            $scope.ui.controller._updateFieldItems($scope.ui.state.sobject());
            await DbUtils.saveUserAsync($scope.ui.state.userData);
            this.objectQueryChangedHandler([], [], $scope);
            this._preventExtraEvents();
            $scope.$apply(undefined);
            this._showUIToast("success", { content: RESOURCES.Config_Message_ConfigSucessfullyUpdated, delay: CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS });
        }, null, null, false);
    }

    removeUnusedConfigFoldersHandler() {
        this._execAsyncSync(async () => {
            let confirmed = await this._showConfirmAsync(RESOURCES.Config_AreYouSureToRemoveUnusedFolders, RESOURCES.Config_CleanupDataDirectory);
            if (confirmed) {
                let folders = AppUtils.getListOfDirs(this.ui.state.userData.basePath);
                let toDelete = folders.filter(folder => {
                    if (!this.ui.state.configs().map(c => c.name).some(x => folder.name == x)) {
                        return !folder.name.startsWith(CONSTANTS.WORKING_SUBFOLDER_NAME_PREFIX);
                    }
                }).map(folder => folder.fullPath);
                AppUtils.deleteDirs(toDelete);
                this._showUIToast("success", {
                    content: RESOURCES.Config_Message_UnusedFolderSuccessfullyRemoved
                });
                this.$scope.$apply(undefined);
            }
        }, null, null, false);
    }

    objectQueryChangedHandler($new: Array<string>, $old: Array<string>, $scope: IAngularScope) {
        $scope.ui.controller._initObjectEditorDataQuery();
    }

    executeTestQueryHandler() {
        this._execAsyncSync(async () => {
            this.ui.configPage.objectEditData.error = undefined;
            try {
                if (!this.ui.configPage.objectEditData.query) {
                    this.ui.configPage.objectEditData.query = this.ui.configPage.objectEditData.originalQuery;
                }
                let parsedQuery = this.ui.state.sobject().parseQueryString(this.ui.configPage.objectEditData.query);
                this.ui.configPage.objectEditData.query = composeQuery(parsedQuery);
                parsedQuery.limit = 1;
                let query = composeQuery(parsedQuery);
                let org = this.ui.configPage.objectEditData.isSource && this.ui.state.sourceOrg().isOrg() ? this.ui.state.sourceOrg() : this.ui.state.targetOrg();
                let records = (await AppUtils.queryAsync(org, query, false)).records;
                let data = [];
                if (records.length > 0) {
                    data = AppUtils.transposeArrayMany(records, RESOURCES.Column_Field, RESOURCES.Column_Value);
                    data.forEach(item => item[RESOURCES.Column_Value] = item[RESOURCES.Column_Value][0]);
                    setTimeout(() => {
                        this._displayDataTable('#testQueryRecordTable', data);
                    }, 300);
                } else {
                    data = [];
                }
                this.ui.configPage.objectEditData.noRecords = data.length == 0;
                this.ui.configPage.objectEditData.isOpen = true;
            } catch (ex) {
                this.ui.configPage.objectEditData.error = ex.message;
            }
        }).finally(() => this.$scope.$apply(undefined));
    }

    updateSObjectQueryHandler() {
        this._execAsyncSync(async () => {
            this.ui.configPage.objectEditData.error = undefined;
            try {

                if (!this.ui.configPage.objectEditData.query) {
                    this.ui.configPage.objectEditData.query = this.ui.configPage.objectEditData.originalQuery;
                }

                let scriptObject = this.ui.state.sobject();

                // Parse + fix the query fields (find closest names)
                let parsedQuery = this.ui.state.sobject().parseQueryString(this.ui.configPage.objectEditData.query);
                let composedQuery = composeQuery(parsedQuery);

                // Fix (upper-case) all soql statemets
                let soqlKeywords = AppUtils.createSoqlKeywords(composedQuery);

                // Update query in UI
                this.ui.configPage.objectEditData.query = soqlKeywords.query;

                // Add excluded fields
                let fields = [].concat(parsedQuery.fields.map(field => (<SOQLField>field).field), scriptObject.excludedFields);

                fields = AppUtils.uniqueArray(fields);

                // Update script object fields
                scriptObject.fields = fields.map(name => {
                    //let name = (<SOQLField>field).rawValue || (<SOQLField>field).field;
                    let descr = scriptObject.sObjectDescribe.fieldsMap.get(name);
                    let label = descr && descr.label || name;
                    return new ScriptObjectField({
                        name,
                        label
                    });
                });

                // Set optional query properties (where / limit / order by)
                scriptObject.limit = parsedQuery.limit;
                let parseResult = AppUtils.parseSoql(soqlKeywords);
                let where = parseResult.filter(item => item.word == 'WHERE')[0];
                let orderBy = parseResult.filter(item => item.word == 'ORDER BY')[0];
                scriptObject.where = where && where.text;
                scriptObject.orderBy = orderBy && orderBy.text;

                // Save script object and user data   
                this._updateFieldItems(scriptObject);
                await DbUtils.saveUserAsync(this.ui.state.userData);
                this._preventExtraEvents();
                this.$scope.$apply(undefined);
                this._showUIToast("success", { content: RESOURCES.Config_Message_ConfigSucessfullyUpdated, delay: CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS });
            } catch (ex) {
                this.ui.configPage.objectEditData.error = ex.message;
                this._showUIToast("error", { content: ex.message });
            }
        }, null, null, false);

    }

    saveConfigParameterHandler() {
        this._execAsyncSync(async () => {
            //this._filterScriptObjectData(this.ui.state.sobject());
            await DbUtils.saveUserAsync(this.ui.state.userData);
        }, RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, false, CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }

    saveConfigParameterDelayedHandler() {
        if (this._saveConfigParameterDelayedTimeout) {
            clearTimeout(this._saveConfigParameterDelayedTimeout);
        }
        this._saveConfigParameterDelayedTimeout = setTimeout(() => {
            this._execAsyncSync(async () => {
                //this._filterScriptObjectData(this.ui.state.sobject());
                await DbUtils.saveUserAsync(this.ui.state.userData);
            }, RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, false, CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
        }, 3000);
    }

    upDownObjectHandler(objectIndex: number, moveDirection: number, first: boolean, last: boolean) {
        if (first && moveDirection < 0 || last && moveDirection > 0) {
            return;
        }
        this._execAsyncSync(async () => {
            let scriptObject = this.ui.state.config().objects.splice(objectIndex, 1)[0];
            this.ui.state.config().objects.splice(objectIndex + moveDirection, 0, scriptObject);
            await DbUtils.saveUserAsync(this.ui.state.userData);
            this.$scope.$apply(undefined);
        }, RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, false, CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }

    removeObjectHandler(objectIndex: number) {
        this._execAsyncSync(async () => {
            this.ui.state.config().objects.splice(objectIndex, 1);
            await DbUtils.saveUserAsync(this.ui.state.userData);
            this.ui.configPage.currentSObjectId = undefined;
            this.$scope.$apply(undefined);
        }, RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, true, CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }

    saveConfigHandler() {
        this._execAsyncSync(async () => {
            await DbUtils.saveUserAsync(this.ui.state.userData);
            this.$scope.$apply(undefined);
        }, RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, true, CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }

    saveConfigDelayedHandler() {
        if (this._saveConfigDelayedTimeout) {
            clearTimeout(this._saveConfigDelayedTimeout);
        }
        this._saveConfigDelayedTimeout = setTimeout(() => {
            this._execAsyncSync(async () => {
                await DbUtils.saveUserAsync(this.ui.state.userData);
                this.$scope.$apply(undefined);
            }, RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, true, CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
        }, 3000);
    }

    externalIdChangedHandler($new: Array<string>, $old: Array<string>, $scope: IAngularScope) {
        if ($new.length == 0
            || $scope.ui.controller._blockExternalIdChangedEvent
            || $scope.ui.configPage.objectEditData.oldExternalId == $new[0]
            || !$scope.ui.state.sobject().isOrgDescribed) {
            return;
        }
        $scope.ui.controller._execAsyncSync(async () => {
            $scope.ui.configPage.objectEditData.oldExternalId = $new[0];
            $scope.ui.state.sobject().externalId = $new[0];
            $scope.ui.controller._updateFieldItems($scope.ui.state.sobject());
            $scope.ui.controller._initObjectEditorDataQuery();
            await DbUtils.saveUserAsync($scope.ui.state.userData);
            $scope.ui.controller._preventExtraEvents();
        }, RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, false, CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }

    polymorphicFieldChangedHandler($new: Array<any>, $old: Array<any>, $scope: IAngularScope, $element: JQuery) {
        if (this._blockOnPolymorphicFieldChangedEvent) {
            return;
        }
        this._blockOnPolymorphicFieldChangedEvent = true;
        this._blockAddRemoveObjectFieldsEvent = true;
        this._execAsyncSync(async () => {
            let scriptObject = $scope.ui.state.sobject();
            let fieldName = $element.attr('data-field-name');
            let field = scriptObject.fields.filter(field => field.name == fieldName)[0];
            if (field) {
                if ($new.length > 0) {
                    field.name = field.cleanName + CONSTANTS.REFERENCE_FIELD_OBJECT_SEPARATOR + $new[0];
                } else {
                    field.name = field.cleanName;
                }
            }
            this._updateFieldItems(scriptObject);
            await DbUtils.saveUserAsync($scope.ui.state.userData);
            this._preventExtraEvents();
            this._showUIToast("success", { content: RESOURCES.Config_Message_ConfigSucessfullyUpdated, delay: CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS });
            $scope.$apply(undefined)
        }, null, null, false);
    }

    externalIdEnterModeChangeHandler() {
        this._blockExternalIdChangedEvent = this.ui.configPage.isComplexExternalIdEditMode;
    }

    addFieldMappingHandler() {
        this._execAsyncSync(async () => {
            this.ui.state.sobject().fieldMapping.push(new ScriptMappingItem());
            this._updateFieldItems(this.ui.state.sobject());
            await DbUtils.saveUserAsync(this.ui.state.userData);
            this.$scope.$apply(undefined);
        }, RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, true, CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);

    }

    removeFieldMappingHandler(index: number) {
        this._execAsyncSync(async () => {
            this.ui.state.sobject().fieldMapping.splice(index, 1);
            this._updateFieldItems(this.ui.state.sobject());
            await DbUtils.saveUserAsync(this.ui.state.userData);
            this.$scope.$apply(undefined);
        }, RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, true, CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }

    fieldMappingChangedHandler(options: any, field: string) {
        this._execAsyncSync(async () => {
            if (typeof options.id != 'undefined') {
                options.id = parseInt(options.id);
                this.ui.state.sobject().fieldMapping[options.id][field] = options.value;
                if (field == 'targetObject' && options.value) {
                    await this._describeSObjectAsync(options.value);
                    this._hideUILoader();
                }
                this._updateFieldItems(this.ui.state.sobject());
                await DbUtils.saveUserAsync(this.ui.state.userData);
                this.$scope.$apply(undefined);
            }
        }, RESOURCES.Config_Message_ConfigSucessfullyUpdated, null, true, CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS);
    }

    fieldMappingInitializeHandler(options: any) {
        this._execAsyncSync(async () => {
            if (typeof options.id != 'undefined') {
                options.id = parseInt(options.id);
                if (options.id == 0) {
                    if (options.value) {
                        await this._describeSObjectAsync(options.value);
                        this._hideUILoader();
                    }
                    this._updateFieldItems(this.ui.state.sobject());
                    this.$scope.$apply(undefined);
                }
            }
        }, null, null, false);
    }

    validateConfigurationHandler() {
        this._execAsyncSync(async () => {
            this._showUILoader(RESOURCES.Config_ValidateConfigurationStarted);
            await AppUtils.sleepAsync(1500);
            await this._validateConfigurationAsync();
            this._preventExtraEvents();
            if (this.ui.configPage.isValid()) {
                this._showUIToast("success", { content: RESOURCES.Config_ValidateConfigurationSucceeded });
            } else {
                this._showUIToast("warning", { title: RESOURCES.DefaultToastWarningTitle, content: RESOURCES.Config_ValidateConfigurationFailed });
            }
            this.$scope.$apply(undefined);
        }, null, null, false);
    }

    reconnectOrgsHandler() {
        this._execAsyncSync(async () => {
            await this._connectOrgsAsync();
            this.ui.configPage.currentSObjectId = undefined;
            this.$scope.$apply(undefined);
        });
    }

    configGoNext() {
        this._execAsyncSync(async () => {
            this._showUILoader(RESOURCES.Config_ValidateConfigurationStarted);
            await AppUtils.sleepAsync(1500);
            await this._validateConfigurationAsync();
            this._preventExtraEvents();
            if (this.ui.configPage.isValid()) {
                this._showUIToast("success", { content: RESOURCES.Config_ValidateConfigurationSucceeded });
                this.$state.go('preview');
                this.ui.previewPage.allowShowing = true;
                this.previewPageSetup();
            } else {
                this._showUIToast("warning", { title: RESOURCES.DefaultToastWarningTitle, content: RESOURCES.Config_ValidateConfigurationFailed });
            }
            this.$scope.$apply(undefined);
        }, null, null, false);
    }

    addMockingItemHandler() {
        this.ui.state.sobject().mockFields.push(new ScriptMockField({
            name: this.ui.configPage.selectedFieldNameForMock,
            pattern: CONSTANTS.DEFAULT_MOCK_PATTERN
        }));
        this._updateFieldItems(this.ui.state.sobject());
        this.saveConfigParameterHandler();
    }

    removeMockingItemHandler(index: number) {
        this.ui.state.sobject().mockFields.splice(index, 1);
        this._updateFieldItems(this.ui.state.sobject());
        this.saveConfigParameterHandler();
    }





    /////////////////////////////////////////////////////////////////////
    // Preview Page /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////

    previewPageSetup() {
        this.ui.previewPage.selectedMigrationDirection =
            this.ui.state.sourceOrg().media == DATA_MEDIA_TYPE.File ? MIGRATION_DIRECTION[MIGRATION_DIRECTION.File2Org]
                : this.ui.state.targetOrg().media == DATA_MEDIA_TYPE.File ? MIGRATION_DIRECTION[MIGRATION_DIRECTION.Org2File]
                    : MIGRATION_DIRECTION[MIGRATION_DIRECTION.Orgs];
        this._generateExportJson();
    }

    generateExportJsonHandler() {
        this._generateExportJson();
    }

    copyCLICommandStringToClipboardHandler() {
        let self = this;
        this.$copyToClipboard.copy(this.ui.previewPage.getCLICommandString()).then(function () {
            self._showUIToast('success', {
                content: RESOURCES.Preview_CLICommandCopiedMessage,
                delay: CONSTANTS.UI_SHORT_TOAST_TIMEOUT_MS
            })
        });
    }

    previewGoNext() {
        this._execAsyncSync(async () => {
            let self = this;
            let command = this.ui.previewPage.getCLICommandString();
            this.ui.executePage.allowShowing = true;
            this.ui.state.scriptIsExecuting = true;
            this.ui.executePage.executeLogHtml = "";
            let executeLogPlain = "";
            self.$scope.$apply(undefined);
            this.$state.go('execute');
            setTimeout(async () => {
                await ConsoleUtils.callConsoleCommand(command, (data) => {
                    switch (data.type) {
                        case CONSOLE_COMMAND_EVENT_TYPE.Close:
                            ___printLog(`<br/><br/>${RESOURCES.Execute_Message_ExecuteFinishedWithCode} ${data.exitCode}`, true);
                            break;
                        case CONSOLE_COMMAND_EVENT_TYPE.Error:
                            ___printLog("", true);
                            break;
                        case CONSOLE_COMMAND_EVENT_TYPE.Exit:
                            ___printLog(`<br/><br/>${RESOURCES.Execute_Message_ExecuteFinishedWithCode} ${data.exitCode}`, true);
                            break;
                        case CONSOLE_COMMAND_EVENT_TYPE.Start:
                            ___printLog(`<br/><b class='text-secondary'>${command}</b><br/>`);
                            break;
                        case CONSOLE_COMMAND_EVENT_TYPE.StdErrData:
                            ___printLog("<span style='color:red'>" + data.message.toString().replace(/\n/g, '<br/>') + '</span>');
                            break;
                        case CONSOLE_COMMAND_EVENT_TYPE.StdOutData:
                            ___printLog(data.message.toString().replace(/\n/g, '<br/>'));
                            break;
                    }
                    return false;
                });
            }, 500);

            // ------------- Local function ------------------- //
            function ___printLog(message: string, stopExecuting: boolean = false) {
                executeLogPlain += message;
                self.ui.executePage.executeLogHtml = self._trustHtml(executeLogPlain);
                self.ui.state.scriptIsExecuting = !stopExecuting;
                self.$scope.$apply(undefined);
                $(".execute-page-section").animate({ scrollTop: $(".execute-page-section").prop("scrollHeight") }, 100);
            }

        }, null, null, false);
    }




    /////////////////////////////////////////////////////////////////////
    // Execute Page /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////

    abortExecutionHandler() {
        this._execAsyncSync(async () => {
            if (this.ui.state.scriptIsExecuting) {
                let confirmed = await this._showConfirmAsync(null, RESOURCES.Execute_AreYouSureToAbortExecution);
                if (confirmed) {
                    ConsoleUtils.killRunningConsoleProcess();
                    this.ui.state.scriptIsExecuting = false;
                    this.$scope.$apply(undefined);
                }
            }
        }, null, null, false);
    }


    /////////////////////////////////////////////////////////////////////
    // Private members //////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////

    // Fields **************************************************

    private _blockAddRemoveObjectFieldsEvent = false;
    private _blockRemoveObjectExcludedFieldsEvent = false;
    private _blockExternalIdChangedEvent = false;
    private _blockOnPolymorphicFieldChangedEvent = false;
    private _saveConfigParameterDelayedTimeout: NodeJS.Timeout;
    private _saveConfigDelayedTimeout: NodeJS.Timeout;


    // Loader **************************************************
    private _uILoader(show?: boolean, message?: string) {
        if (show) {
            $('.ajax-loader, .ajax-load-message').removeClass('hidden');
            $('.ajax-load-message > span').text(message);
        } else {
            $('.ajax-loader, .ajax-load-message').addClass('hidden');
        }
    }

    private _showUILoader(message?: string) {
        this._uILoader(true, message || RESOURCES.Loader_DefaultLoaderMessage);
    }

    private _hideUILoader() {
        setTimeout(() => {
            this._uILoader();
        }, 200);
    }

    // Toast **************************************************        
    private _showUIToast(type: "info" | "success" | "warning" | 'error' = CONSTANTS.DEFAULT_TOAST_TYPE,
        options?: {
            title?: string,
            content?: string,
            delay?: number
        }) {
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
            title: options.title || RESOURCES.DefaultToastTitle,
            content: options.content || RESOURCES.DefaultToastMessage,
            delay: options.delay || CONSTANTS.UI_TOAST_TIMEOUT_MS
        });
    }

    // Modal dialogs **************************************************        
    private _showPromptAsync(message: string, title: string, defaultValue: string): Promise<string> {
        return new Promise(resolve => {
            title = title || RESOURCES.DefaultModalTitlePrompt;
            message = message || RESOURCES.DefaultModalMessagePrompt;
            this.bootbox.prompt({
                title,
                message,
                value: defaultValue,
                backdrop: true,
                callback: function (value: any) {
                    if (value == null)
                        resolve(undefined);
                    else
                        resolve(value);
                }
            });
        });
    }

    private _showConfirmAsync(message: string, title: string): Promise<boolean> {
        return new Promise(resolve => {
            message = message || RESOURCES.DefaultModalMessageConfirm;
            title = title || RESOURCES.DefaultModalTitleConfirm;
            this.bootbox.confirm({
                title,
                message,
                backdrop: true,
                callback: function (value: any) {
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
    private _preventExtraEvents() {
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



    private _execAsyncSync(fn: () => Promise<any>, successMessage?: string, errorMessage?: string,
        showLoader: boolean = true,
        toastDelayMs: number = undefined): Promise<any> {
        let self = this;
        if (showLoader) {
            this._showUILoader();
        }
        return new Promise<any>((resolve, reject) => {
            AppUtils.execAsyncSync(async () => fn()).then((result) => {
                if (successMessage) {
                    self._showUIToast('success', {
                        title: RESOURCES.DefaultToastMessage,
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
                    title: RESOURCES.DefaultToastErrorTitle,
                    content: errorMessage || err.message || RESOURCES.DefaultToastErrorMessage,
                    delay: toastDelayMs
                });
                reject(err);
            }).finally(() => {
                this._hideUILoader();
                this._refreshUI();
            });
        });
    }

    private _refreshUI() {
        let self = this;
        this.$timeout(function () {
            $('[data-toggle="tooltip"]').tooltip('dispose');
            $('[data-toggle="tooltip"]').tooltip();
            $('[data-config-selector],[data-org-selector1],[data-org-selector2],[data-config-sobjects-selector],[data-config-externalid-selector]').selectpicker('refresh');
            $('.btn-switch:contains("Off")').addClass('.switch-off').attr('style', 'background-color: #FFF !important;    color: #495057 !important;    border: none !important;');
            self._addBsSelectWatcher("[data-config-externalid-selector]", self.externalIdChangedHandler);
        }, 500);
    }

    private _addWhatcher(propertyName: string, handler: ($new: any, $old: any, $scope: any) => void) {
        this.$scope.$watch(propertyName, ($new: any, $old: any, $scope: any) => {
            if (!AppUtils.isEquals($old, $new) && handler) {
                handler($new, $old, $scope);
            }
        });
    }

    private _addBsSelectWatcher(selector: string, handler: ($new: any, $old: any, $scope: any) => void) {
        let self = this;
        $(selector).off('changed.bs.select').on('changed.bs.select', function (e: any) {
            let $new = [];
            for (let opt of e.target.selectedOptions) {
                $new.push(opt.value);
            }
            handler($new, [], self.$scope);
        });
    }

    private _downloadFile(filePath: string) {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8').trim();
            const element = document.createElement("a");
            const type = mime.lookup(filePath);
            const file = new Blob([content], { type: String(type) });
            element.href = URL.createObjectURL(file);
            element.download = path.basename(filePath);
            element.click();
        }
    }

    private _readSingleFile(e: any) {
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

    private async _describeSObjectAsync(objectName: string): Promise<void> {
        if (this.ui.state.sourceOrg().isOrg()) {
            let object = this.ui.state.sourceOrg().objectsMap.get(objectName);
            if (object) {
                if (!object.isValid()) {
                    // Describe Source...
                    this._showUILoader(RESOURCES.Config_DescribingSObject.format(objectName, RESOURCES.Source));
                    await AppUtils.describeSObjectAsync(this.ui.state.sourceOrg(), objectName, object);
                }
            }
        }
        if (this.ui.state.targetOrg().isOrg()) {
            let object = this.ui.state.targetOrg().objectsMap.get(objectName);
            if (object) {
                if (!object.isValid()) {
                    // Describe Target...
                    this._showUILoader(RESOURCES.Config_DescribingSObject.format(objectName, RESOURCES.Target));
                    await AppUtils.describeSObjectAsync(this.ui.state.targetOrg(), objectName, object);
                }
            }
        }
    }

    private _initObjectEditorDataQuery() {
        this.ui.configPage.objectEditData.originalQuery = this.ui.state.sobject().getTestQuery(null);
        this.ui.configPage.objectEditData.query = this.ui.state.sobject().getTestQuery(null);
    }

    private _displayDataTable(selector: string, data: Array<any>, columnsMap?: Map<string, string>) {
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

    private _textToHtml(text: string) {
        return this._trustHtml(AppUtils.textToHtmlString(text));
    }

    private _trustHtml(html: string) {
        return this.$sce.trustAsHtml(html);
    }

    private _updateFieldItems(scriptObject: ScriptObject) {
        scriptObject.updateFieldItems();
        this.ui.configPage.updateFieldItems();
        this.ui.configPage.selectedFieldNameForMock = scriptObject.availableFieldItemsForMocking[0]
            && scriptObject.availableFieldItemsForMocking[0].name;
    }

    private async _validateConfigurationAsync(): Promise<void> {
        for (let index = 0; index < this.ui.state.config().objects.length; index++) {
            const scriptObject = this.ui.state.config().objects[index];
            await this._describeSObjectAsync(scriptObject.name);
            this._updateFieldItems(scriptObject);
        }
    }

    private async _connectOrgsAsync(): Promise<void> {

        // Connect to Source
        if (this.ui.state.sourceOrg().isOrg()) {
            try {
                this._showUILoader(RESOURCES.Home_Message_ConnectingOrg.format(RESOURCES.Source));
                await AppUtils.connectOrg(this.ui.state.sourceOrg());
            } catch (ex) {
                throw new Error(RESOURCES.Home_Error_UnableToConnectToOrg.format(RESOURCES.Source));
            }
        }
        // Connect to Target
        if (this.ui.state.targetOrg().isOrg()) {
            try {
                this._showUILoader(RESOURCES.Home_Message_ConnectingOrg.format(RESOURCES.Target));
                await AppUtils.connectOrg(this.ui.state.targetOrg());
            } catch (ex) {
                throw new Error(RESOURCES.Home_Error_UnableToConnectToOrg.format(RESOURCES.Target));
            }
        }

        // Reading the Source objects list
        if (this.ui.state.sourceOrg().isOrg()) {
            try {
                this._showUILoader(RESOURCES.Home_Message_RetrievingOrgMetadata.format(RESOURCES.Source));
                let objects = await AppUtils.getOrgObjectsList(this.ui.state.sourceOrg());
                this.ui.state.sourceOrg().objectsMap.clear();
                objects.forEach(obj => {
                    this.ui.state.sourceOrg().objectsMap.set(obj.name, obj);
                })
            } catch (ex) {
                throw new Error(RESOURCES.Home_Error_UnableToRetrieveMetadata.format(RESOURCES.Source));
            }
        }

        // Reading the Target objects list
        if (this.ui.state.targetOrg().isOrg()) {
            try {
                this._showUILoader(RESOURCES.Home_Message_RetrievingOrgMetadata.format(RESOURCES.Target));
                let objects = await AppUtils.getOrgObjectsList(this.ui.state.targetOrg());
                this.ui.state.targetOrg().objectsMap.clear();
                objects.forEach(obj => {
                    this.ui.state.targetOrg().objectsMap.set(obj.name, obj);
                })
            } catch (ex) {
                throw new Error(RESOURCES.Home_Error_UnableToRetrieveMetadata.format(RESOURCES.Target));
            }
        }
        this._showUIToast('success', { content: RESOURCES.Home_Message_MetadataRetrieveSuccess });

    }

    private _generateExportJson() {
        this.ui.previewPage.exportJson =
            this.ui.previewPage.isFullExportJson
                ? this.ui.state.config().toExportJson(this.ui,
                    AppUIState.appSettings.isDebug,
                    CONSTANTS.EXPORT_JSON_FULL_TAG) :
                this.ui.state.config().toExportJson(this.ui,
                    AppUIState.appSettings.isDebug,
                    CONSTANTS.EXPORT_JSON_TAG);
        try {
            fs.writeFileSync(this.ui.state.config().exportJsonFilename, this.ui.previewPage.exportJson);
        } catch (ex) { }
    }

    private _displayNewVersionMessage() {
        setTimeout(async () => {
            await this.ui.state.setNewVersionMessage();
            this.$scope.$apply(undefined);
        });
    }

}
