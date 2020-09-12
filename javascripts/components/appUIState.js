"use strict";
/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppUIState = void 0;
const org_1 = require("../models/org");
const config_1 = require("../models/config");
const statics_1 = require("./statics");
const appUtils_1 = require("./appUtils");
const scriptObject_1 = require("../models/scriptObject");
const ScriptObjectField_1 = require("../models/ScriptObjectField");
const form_1 = require("../models/form");
const resources_1 = require("./resources");
const fieldItem_1 = require("../models/fieldItem");
const helper_classes_1 = require("./helper_classes");
const path = require('path');
const platformFolders = require('platform-folders');
/**
 * Class to hold all UI data
 */
class AppUIState {
    /////////////////////////////////////
    // Common ///////////////////////////
    /////////////////////////////////////
    constructor(controller) {
        //////////////////////////////////////////////
        // Pages &  state ////////////////////////////
        //////////////////////////////////////////////
        this.state = {
            // Fields  ********************************
            userData: null,
            scriptIsExecuting: false,
            newVersionMessage: null,
            // Methods / Properties ********************************
            isLoggedIn: () => this.state.userData != null,
            orgs: () => this.state.isLoggedIn() ? this.state.userData.orgs : [],
            configs: ($new) => {
                if (!$new) {
                    return this.state.isLoggedIn() ? this.state.userData.configs : [];
                }
                else {
                    this.state.userData.configs = $new;
                    return $new;
                }
            },
            pageName: () => this.controller.$state["$current"].name,
            sourceOrg: () => this.state.userData.orgs.filter(org => org.sourceType == statics_1.SOURCE_TYPE.Source)[0] || new org_1.Org(),
            targetOrg: () => this.state.userData.orgs.filter(org => org.sourceType == statics_1.SOURCE_TYPE.Target)[0] || new org_1.Org(),
            config: () => {
                return this.state.configs().filter(config => config.id == this.configPage.allConfigIds[0])[0] || new config_1.Config();
            },
            sobject: () => {
                return this.state.config().objects.filter(object => object.name == this.configPage.currentSObjectId)[0] || new scriptObject_1.ScriptObject();
            },
            availableSObjects: () => {
                let self = this;
                return ___getObject().filter(object => {
                    return !statics_1.CONSTANTS.NOT_SUPPORTED_OBJECTS.some(name => object.name == name);
                });
                // ------------ Local function --------------- //
                function ___getObject() {
                    if (self.state.sourceOrg().isFile()) {
                        return self.state.targetOrg().objects;
                    }
                    if (self.state.targetOrg().isFile()) {
                        return self.state.sourceOrg().objects;
                    }
                    return appUtils_1.AppUtils.intersect(self.state.sourceOrg().objects, self.state.targetOrg().objects, "name");
                }
            },
            orgDataSourcesAmount: () => {
                return this.state.orgs().filter(org => org.isOrg()).length;
            },
            hasFileSource: () => {
                return this.state.sourceOrg().isFile() || this.state.targetOrg().isFile();
            },
            // Event Handlers ********************************
            switchStateHandler: null,
            openBasePathInExplorerHandler: null,
            openConfigInExplorerHandler: null,
            setSourceTargetOrgs: () => {
                this.state.orgs().forEach(org => {
                    org.sourceType = this.homePage.currentSourceOrgIds[0] == org.id ? statics_1.SOURCE_TYPE.Source
                        : this.homePage.currentTargetOrgIds[0] == org.id ? statics_1.SOURCE_TYPE.Target
                            : statics_1.SOURCE_TYPE.Unknown;
                });
            },
            abortExecutionHandler: null,
            setNewVersionMessage: () => __awaiter(this, void 0, void 0, function* () {
                const packageJsonRemote = yield appUtils_1.AppUtils.readRemoveJsonAsync(this.settings.packageJsonUrl);
                if (packageJsonRemote.version != this.settings.version) {
                    this.state.newVersionMessage = resources_1.RESOURCES.NewVersionAvailable.format(packageJsonRemote.version, this.settings.version, this.settings.repoUrl);
                }
                else {
                    this.state.newVersionMessage = "";
                }
            })
        };
        this.indexPage = {
            // Methods / Properties ********************************
            viewPlaceholderClass: () => this.state.isLoggedIn() ? "bg-main" : "",
            menuActiveClasses: () => {
                return {
                    home: ['home', 'config', 'preview', 'execute'].indexOf(this.state.pageName()) >= 0 ? ' active ' : '',
                    register: this.state.pageName() == 'register' ? ' active ' : '',
                    login: this.state.pageName() == 'login' ? ' active ' : '',
                    profile: this.state.pageName() == 'profile' ? ' active ' : ''
                };
            },
            // Event Handlers ********************************
            logOffHandler: null
        };
        this.loginPage = {
            // Fields ********************************
            form: new form_1.Form(),
            // Event Handlers ********************************
            loginHandler: null
        };
        this.registerPage = {
            // Fields ********************************
            form: new form_1.Form(),
            // Event Handlers ********************************
            registerHandler: null
        };
        this.profilePage = {
            // Fields ********************************
            form: new form_1.Form(),
            settingsForm: {},
            // Event Handlers ********************************
            saveEmailAndPasswordHandler: null,
            saveApplicationSettingsHandler: null,
            openChangeBasePathDialogHandler: null
        };
        this.homePage = {
            // Fields ********************************
            currentSourceOrgIds: new Array(),
            currentTargetOrgIds: new Array(),
            cliOutput: resources_1.RESOURCES.Home_ExecuteSFDXCommandDescription,
            cliOutputPlain: null,
            // Methods / Properties ********************************
            isValid: () => !(this.homePage.currentSourceOrgIds[0] == this.homePage.currentTargetOrgIds[0]
                || !this.homePage.currentSourceOrgIds[0]
                || !this.homePage.currentTargetOrgIds[0]),
            isShown: () => this.state.isLoggedIn(),
            // Event Handlers ********************************
            refreshOrgsListHandler: null,
            goNext: null,
            executeForceOrgListHandler: null,
            executeForceOrgDisplayHandler: null,
            downloadCLICommadOutputHandler: null
        };
        this.configPage = {
            // Fields ********************************
            allConfigIds: new Array(),
            allSObjectIds: new Array(),
            currentSObjectId: null,
            objectEditData: new helper_classes_1.ObjectEditData(),
            isComplexExternalIdEditMode: false,
            availableTargetSObjectNamesForFieldMapping: new Array(),
            availableTargetSFieldsNamesForFieldMapping: new Array(),
            selectedFieldNameForMock: "",
            // Methods / Properties ********************************
            isValid: () => {
                return this.state.config().isValid();
            },
            isShown: () => this.state.sourceOrg().sourceType != statics_1.SOURCE_TYPE.Unknown
                && this.state.targetOrg().sourceType != statics_1.SOURCE_TYPE.Unknown,
            availableSObjects: () => {
                if (!this.state.config())
                    return new Array();
                return appUtils_1.AppUtils.exclude(this.state.availableSObjects(), this.state.config().objects, "name");
            },
            showRemoveUnusedConfigFildersButton: () => {
                let folders = appUtils_1.AppUtils.getListOfDirs(this.state.userData.basePath);
                let toDelete = folders.filter(folder => {
                    if (!folder.name.startsWith('_')) {
                        if (!this.state.configs().map(c => c.name).some(x => folder.name == x)) {
                            return true;
                        }
                    }
                }).map(folder => folder.fullPath);
                return toDelete.length > 0;
            },
            _operationList: null,
            operationList: () => {
                if (!this.configPage._operationList) {
                    this.configPage._operationList = appUtils_1.AppUtils.listEnum(statics_1.OPERATION)
                        .filter(item => item != statics_1.OPERATION[statics_1.OPERATION.Unknown])
                        .map(item => new helper_classes_1.SelectItem({
                        value: item,
                        text: item
                    }));
                }
                return this.configPage._operationList;
            },
            getObjectQuickInfoString: (objectIndex) => {
                let scriptObject = this.state.config().objects[objectIndex];
                return `${scriptObject.master ? resources_1.RESOURCES.Config_MasterTag + ' | ' : ''}${scriptObject.operation} | ${scriptObject.externalId}${scriptObject.deleteOldData ? ' | ' + resources_1.RESOURCES.Config_DeleteOldDataTag : ''}`;
            },
            disableAddNewFieldMappingItemButton: () => {
                return this.state.sobject().fieldMapping.length > 0 && !this.state.sobject().targetSobjectNameForFieldMapping;
            },
            // Event Handlers ********************************
            goNext: null,
            switchOrgsHandler: null,
            addConfigClickHandler: null,
            editConfigClickHandler: null,
            cloneConfigClickHandler: null,
            uploadConfigChangeHandler: null,
            downloadConfigClickHandler: null,
            removeConfigClickHandler: null,
            addObjectsClickHandler: null,
            selectObjectClickHandler: null,
            addRemoveObjectFieldsHandler: ($scope, $new, $element) => {
                let list1 = $new.map(field => { return { name: field.name }; });
                let list2 = this.state.sobject().fields.map(field => { return { name: field.name }; });
                if (!appUtils_1.AppUtils.isEquals(list1, list2)) {
                    this.controller.addRemoveObjectFieldsHandler($scope, $new.map(field => new ScriptObjectField_1.ScriptObjectField(field)), $element);
                }
            },
            addRemoveObjectExcludedFieldsHandler: ($scope, $new, $element) => {
                let list1 = $new.map(field => field.name);
                let list2 = this.state.sobject().excludedFields;
                if (!appUtils_1.AppUtils.isEquals(list1, list2)) {
                    this.controller.addRemoveObjectExcludedFieldsHandler($scope, $new, $element);
                }
            },
            removeUnusedConfigFoldersHandler: null,
            updateSObjectQueryHandler: null,
            executeTestQueryHandler: null,
            saveConfigParameterHandler: null,
            saveConfigParameterDelayedHandler: null,
            polymorphicFieldChangedHandler: null,
            externalIdEnterModeChangeHandler: null,
            upDownObjectHandler: null,
            removeObjectHandler: null,
            saveConfigHandler: null,
            saveConfigDelayedHandler: null,
            addFieldMappingHandler: null,
            removeFieldMappingHandler: null,
            fieldMappingChangedHandler: null,
            fieldMappingInitializeHandler: null,
            validateConfigurationHandler: null,
            reconnectOrgsHandler: null,
            addMockingItemHandler: null,
            removeMockingItemHandler: null,
            updateFieldItems: () => {
                // availableTargetSObjectNamesForFieldMapping -------------- //
                this.configPage.availableTargetSObjectNamesForFieldMapping = appUtils_1.AppUtils.uniqueArray(this.state.orgs()
                    .filter(org => org.media == statics_1.DATA_MEDIA_TYPE.Org)
                    .reduce((acc, org) => {
                    if (org.isDescribed) {
                        acc = acc.concat(org.objects.map(object => object.name));
                    }
                    return acc;
                }, []))
                    .sort()
                    .map(value => new fieldItem_1.FieldItem({
                    name: value
                }));
                // availableTargetSFieldsNamesForFieldMapping --------------- //
                let targetObject = this.state.sobject().targetSobjectNameForFieldMapping;
                if (targetObject) {
                    this.configPage.availableTargetSFieldsNamesForFieldMapping = appUtils_1.AppUtils.uniqueArray(this.state.orgs()
                        .filter(org => org.media == statics_1.DATA_MEDIA_TYPE.Org)
                        .reduce((acc, org) => {
                        if (org.isDescribed) {
                            let fields = org.objectsMap.get(targetObject)
                                && org.objectsMap.get(targetObject).fields.map(field => field.name);
                            if (fields) {
                                acc = acc.concat(fields);
                            }
                        }
                        return acc;
                    }, []))
                        .sort()
                        .map(value => new fieldItem_1.FieldItem({
                        name: value
                    }));
                }
            }
        };
        this.previewPage = {
            // Fields ********************************
            selectedMigrationDirection: "",
            isFullExportJson: false,
            exportJson: "",
            allowShowing: false,
            // Methods / Properties ********************************
            isValid: () => {
                return true;
            },
            isShown: () => {
                return this.configPage.isValid() && (this.previewPage.allowShowing || this.state.scriptIsExecuting);
            },
            migrationDirections: () => {
                return this.state.hasFileSource()
                    ? statics_1.CONSTANTS.MIGRATION_DIRECTIONS.filter(item => item.value != statics_1.MIGRATION_DIRECTION[statics_1.MIGRATION_DIRECTION.Orgs])
                    : statics_1.CONSTANTS.MIGRATION_DIRECTIONS;
            },
            migrationDirectionSelectorIsDisabled: () => {
                return this.state.hasFileSource();
            },
            getSelectedMigrationDirectionEnum: () => {
                return statics_1.MIGRATION_DIRECTION[this.previewPage.selectedMigrationDirection];
            },
            getCLICommandString: () => {
                if (!this.state.config().isInitialized()) {
                    return "";
                }
                let useFileSource = this.previewPage.getSelectedMigrationDirectionEnum() == statics_1.MIGRATION_DIRECTION.File2Org;
                let useFileTarget = this.previewPage.getSelectedMigrationDirectionEnum() == statics_1.MIGRATION_DIRECTION.Org2File;
                return `sfdx sfdmu:run --sourceusername ${useFileSource ? "csvfile" : this.state.sourceOrg().name} --targetusername ${useFileTarget ? "csvfile" : this.state.targetOrg().name} --path ${this.state.config().exportJsonFilepath} --verbose`;
            },
            // Event Handlers ********************************
            generateExportJsonHandler: null,
            copyCLICommandStringToClipboardHandler: null,
            goNext: null
        };
        this.executePage = {
            // Fields ********************************
            allowShowing: false,
            executeLogHtml: null,
            // Methods / Properties ********************************
            isShown: () => {
                return this.previewPage.isShown() && (this.executePage.allowShowing || this.state.scriptIsExecuting);
            },
            // Event Handlers ********************************
            getCLICommandString: this.previewPage.getCLICommandString,
        };
        this.controller = controller;
        // Common ****************************
        this.state.switchStateHandler = this.controller.switchStateHandler.bind(this.controller);
        this.state.openBasePathInExplorerHandler = this.controller.openBasePathInExplorerHandler.bind(this.controller);
        this.state.openConfigInExplorerHandler = this.controller.openConfigInExplorerHandler.bind(this.controller);
        // Login page *************************
        this.loginPage.loginHandler = this.controller.loginHandler.bind(this.controller);
        this.indexPage.logOffHandler = this.controller.logOffHandler.bind(this.controller);
        // Register page *************************
        this.registerPage.registerHandler = this.controller.registerHandler.bind(this.controller);
        this.homePage.refreshOrgsListHandler = this.controller.refreshOrgsListHandler.bind(this.controller);
        // Profile page *************************
        this.profilePage.saveEmailAndPasswordHandler = this.controller.saveEmailAndPasswordHandler.bind(this.controller);
        this.profilePage.saveApplicationSettingsHandler = this.controller.saveApplicationSettingsHandler.bind(this.controller);
        this.profilePage.openChangeBasePathDialogHandler = this.controller.openChangeBasePathDialogHandler.bind(this.controller);
        // Home page *************************
        this.homePage.goNext = this.controller.homeGoNext.bind(this.controller);
        this.homePage.executeForceOrgListHandler = this.controller.executeForceOrgListHandler.bind(this.controller);
        this.homePage.executeForceOrgDisplayHandler = this.controller.executeForceOrgDisplayHandler.bind(this.controller);
        this.homePage.downloadCLICommadOutputHandler = this.controller.downloadCLICommadOutputHandler.bind(this.controller);
        // Config page *************************
        this.configPage.goNext = this.controller.configGoNext.bind(this.controller);
        this.configPage.addConfigClickHandler = this.controller.addConfigClickHandler.bind(this.controller);
        this.configPage.editConfigClickHandler = this.controller.editConfigClickHandler.bind(this.controller);
        this.configPage.cloneConfigClickHandler = this.controller.cloneConfigClickHandler.bind(this.controller);
        this.controller.$scope["uploadConfigChangeHandler"] = this.configPage.uploadConfigChangeHandler = this.controller.uploadConfigChangeHandler.bind(this.controller);
        this.configPage.downloadConfigClickHandler = this.controller.downloadConfigClickHandler.bind(this.controller);
        this.configPage.removeConfigClickHandler = this.controller.removeConfigClickHandler.bind(this.controller);
        this.configPage.addObjectsClickHandler = this.controller.addObjectsClickHandler.bind(this.controller);
        this.configPage.selectObjectClickHandler = this.controller.selectObjectClickHandler.bind(this.controller);
        this.configPage.switchOrgsHandler = this.controller.switchOrgsHandler.bind(this.controller);
        this.configPage.removeUnusedConfigFoldersHandler = this.controller.removeUnusedConfigFoldersHandler.bind(this.controller);
        this.configPage.updateSObjectQueryHandler = this.controller.updateSObjectQueryHandler.bind(this.controller);
        this.configPage.executeTestQueryHandler = this.controller.executeTestQueryHandler.bind(this.controller);
        this.configPage.saveConfigParameterHandler = this.controller.saveConfigParameterHandler.bind(this.controller);
        this.configPage.saveConfigParameterDelayedHandler = this.controller.saveConfigParameterDelayedHandler.bind(this.controller);
        this.configPage.polymorphicFieldChangedHandler = this.controller.polymorphicFieldChangedHandler.bind(this.controller);
        this.configPage.externalIdEnterModeChangeHandler = this.controller.externalIdEnterModeChangeHandler.bind(this.controller);
        this.configPage.upDownObjectHandler = this.controller.upDownObjectHandler.bind(this.controller);
        this.configPage.removeObjectHandler = this.controller.removeObjectHandler.bind(this.controller);
        this.configPage.saveConfigHandler = this.controller.saveConfigHandler.bind(this.controller);
        this.configPage.saveConfigDelayedHandler = this.controller.saveConfigDelayedHandler.bind(this.controller);
        this.configPage.addFieldMappingHandler = this.controller.addFieldMappingHandler.bind(this.controller);
        this.configPage.removeFieldMappingHandler = this.controller.removeFieldMappingHandler.bind(this.controller);
        this.configPage.fieldMappingChangedHandler = this.controller.fieldMappingChangedHandler.bind(this.controller);
        this.configPage.fieldMappingInitializeHandler = this.controller.fieldMappingInitializeHandler.bind(this.controller);
        this.configPage.validateConfigurationHandler = this.controller.validateConfigurationHandler.bind(this.controller);
        this.configPage.reconnectOrgsHandler = this.controller.reconnectOrgsHandler.bind(this.controller);
        this.configPage.addMockingItemHandler = this.controller.addMockingItemHandler.bind(this.controller);
        this.configPage.removeMockingItemHandler = this.controller.removeMockingItemHandler.bind(this.controller);
        // Preview page *************************
        this.previewPage.generateExportJsonHandler = this.controller.generateExportJsonHandler.bind(this.controller);
        this.previewPage.copyCLICommandStringToClipboardHandler = this.controller.copyCLICommandStringToClipboardHandler.bind(this.controller);
        this.previewPage.goNext = this.controller.previewGoNext.bind(this.controller);
        // Execute page *************************
        this.state.abortExecutionHandler = this.controller.abortExecutionHandler.bind(this.controller);
    }
    ;
    static get appSettings() {
        if (!this._appSettings) {
            const packageJson = appUtils_1.AppUtils.readPackageJson();
            const userJson = appUtils_1.AppUtils.readUserJson();
            AppUIState._appSettings = appUtils_1.AppUtils.objectAssignSafeDefined({}, 
            // Basic default app settings *************
            statics_1.CONSTANTS.DEFAULT_APP_SETTINGS, 
            // Extended default app settings *************                
            {
                db_basePath: platformFolders.getDesktopFolder(),
                isDebug: process.env.DEBUG == "true",
                app_title: packageJson.description + ' (v' + packageJson.version + ')',
                version: packageJson.version,
                repoUrl: packageJson.repository,
                packageJsonUrl: packageJson.package_json
            }, 
            // User settings override the defaults **********
            {
                db_name: userJson.db_name,
                db_path: userJson.db_path,
                db_basePath: userJson.db_basePath || platformFolders.getDesktopFolder()
            });
        }
        return this._appSettings;
    }
    /**
     * Make app settings accessible via $scope within the Controller ...
     */
    get settings() {
        return AppUIState.appSettings;
    }
    /////////////////////////////////////
    // Other ////////////////////////////
    /////////////////////////////////////
    get externalId() {
        return [this.state.sobject().externalId];
    }
    set externalId(value) {
        this.state.sobject().externalId = value[0];
    }
}
exports.AppUIState = AppUIState;
//# sourceMappingURL=appUIState.js.map