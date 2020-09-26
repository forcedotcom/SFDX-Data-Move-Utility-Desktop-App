/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { UserDataWrapper } from "../models/userDataWrapper";
import { Org } from "../models/org";
import { Config } from "../models/config";
import { Controller } from "./controller";
import { SOURCE_TYPE, CONSTANTS, OPERATION, DATA_MEDIA_TYPE, MIGRATION_DIRECTION } from "./statics";
import { SObjectDescribe } from "../models/sobjectDescribe";
import { AppUtils } from "./appUtils";
import { ScriptObject } from "../models/scriptObject";
import { ScriptObjectField } from "../models/ScriptObjectField";
import { IAngularScope, IAppSettings, IPackageJson } from "./helper_interfaces";
import { Form } from "../models/form";
import { RESOURCES } from "./resources";
import { FieldItem } from "../models/fieldItem";
import { ObjectEditData, SelectItem } from "./helper_classes";
const path = require('path')
const platformFolders = require('platform-folders');

/**
 * Class to hold all UI data
 */
export class AppUIState {

    controller: Controller;


    /////////////////////////////////////
    // Common ///////////////////////////
    /////////////////////////////////////

    constructor(controller: Controller) {

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

    };

    /**
     * The global static settings 
     * (available across whole application)
     */
    private static _appSettings: IAppSettings;

    public static get appSettings(): IAppSettings {
        if (!this._appSettings) {
            const packageJson = AppUtils.readPackageJson();
            const userJson = AppUtils.readUserJson();
            AppUIState._appSettings = AppUtils.objectAssignSafeDefined({},

                // Basic default app settings *************
                CONSTANTS.DEFAULT_APP_SETTINGS,

                // Extended default app settings *************                
                <IAppSettings>{
                    db_basePath: platformFolders.getDocumentsFolder(),
                    isDebug: process.env.DEBUG == "true",
                    app_title: packageJson.description + ' (v' + packageJson.version + ')',
                    version: packageJson.version,
                    repoUrl: packageJson.repository,
                    packageJsonUrl: packageJson.package_json
                },

                // User settings override the defaults **********
                <IAppSettings>{
                    db_name: userJson.db_name,
                    db_path: userJson.db_path,
                    db_basePath: userJson.db_basePath || platformFolders.getDocumentsFolder()
                });
        }
        return this._appSettings;
    }

    /**
     * Make app settings accessible via $scope within the Controller ...
     */
    get settings(): IAppSettings {
        return AppUIState.appSettings;
    }


    //////////////////////////////////////////////
    // Pages &  state ////////////////////////////
    //////////////////////////////////////////////

    state = {

        // Fields  ********************************
        userData: <UserDataWrapper>null,
        scriptIsExecuting: false,
        newVersionMessage: <string>null,

        // Methods / Properties ********************************
        isLoggedIn: () => this.state.userData != null,
        orgs: (): Org[] => this.state.isLoggedIn() ? this.state.userData.orgs : [],
        configs: ($new?: Array<Config>): Config[] => {
            if (!$new) {
                return this.state.isLoggedIn() ? this.state.userData.configs : [];
            } else {
                this.state.userData.configs = $new;
                return $new;
            }
        },
        pageName: (): string => this.controller.$state["$current"].name,
        sourceOrg: (): Org => this.state.userData.orgs.filter(org => org.sourceType == SOURCE_TYPE.Source)[0] || new Org(),
        targetOrg: (): Org => this.state.userData.orgs.filter(org => org.sourceType == SOURCE_TYPE.Target)[0] || new Org(),
        config: (): Config => {
            return this.state.configs().filter(config => config.id == this.configPage.allConfigIds[0])[0] || new Config();
        },
        sobject: (): ScriptObject => {
            return this.state.config().objects.filter(object => object.name == this.configPage.currentSObjectId)[0] || new ScriptObject();
        },
        availableSObjects: (): SObjectDescribe[] => {
            let self = this;
            return ___getObject().filter(object => {
                return !CONSTANTS.NOT_SUPPORTED_OBJECTS.some(name => object.name == name);
            });

            // ------------ Local function --------------- //
            function ___getObject(): SObjectDescribe[] {
                if (self.state.sourceOrg().isFile()) {
                    return self.state.targetOrg().objects;
                }
                if (self.state.targetOrg().isFile()) {
                    return self.state.sourceOrg().objects;
                }
                return AppUtils.intersect(self.state.sourceOrg().objects, self.state.targetOrg().objects, "name");

            }
        },
        orgDataSourcesAmount: (): number => {
            return this.state.orgs().filter(org => org.isOrg()).length;
        },
        hasFileSource: (): boolean => {
            return this.state.sourceOrg().isFile() || this.state.targetOrg().isFile();
        },


        // Event Handlers ********************************
        switchStateHandler: <Function>null,
        openBasePathInExplorerHandler: <Function>null,
        openConfigInExplorerHandler: <Function>null,
        setSourceTargetOrgs: () => {
            this.state.orgs().forEach(org => {
                org.sourceType = this.homePage.currentSourceOrgIds[0] == org.id ? SOURCE_TYPE.Source
                    : this.homePage.currentTargetOrgIds[0] == org.id ? SOURCE_TYPE.Target
                        : SOURCE_TYPE.Unknown;
            });
        },
        abortExecutionHandler: <Function>null,
        setNewVersionMessage: async () => {
            const packageJsonRemote: IPackageJson = await AppUtils.readRemoveJsonAsync(this.settings.packageJsonUrl);
            if (packageJsonRemote.version != this.settings.version) {
                this.state.newVersionMessage = RESOURCES.NewVersionAvailable.format(packageJsonRemote.version, this.settings.version, this.settings.repoUrl);
            } else {
                this.state.newVersionMessage = "";
            }
        }
    };

    indexPage = {

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
        logOffHandler: <Function>null

    };

    loginPage = {

        // Fields ********************************
        form: new Form(),

        // Event Handlers ********************************
        loginHandler: <Function>null
    };

    registerPage = {

        // Fields ********************************
        form: new Form(),

        // Event Handlers ********************************
        registerHandler: <Function>null
    };

    profilePage = {

        // Fields ********************************
        form: new Form(),
        settingsForm: <IAppSettings>{},

        // Event Handlers ********************************
        saveEmailAndPasswordHandler: <Function>null,
        saveApplicationSettingsHandler: <Function>null,
        openChangeBasePathDialogHandler: <Function>null
    };

    homePage = {

        // Fields ********************************
        currentSourceOrgIds: new Array<string>(),
        currentTargetOrgIds: new Array<string>(),
        cliOutput: RESOURCES.Home_ExecuteSFDXCommandDescription,
        cliOutputPlain: <string>null,

        // Methods / Properties ********************************
        isValid: () => !(this.homePage.currentSourceOrgIds[0] == this.homePage.currentTargetOrgIds[0]
            || !this.homePage.currentSourceOrgIds[0]
            || !this.homePage.currentTargetOrgIds[0]),
        isShown: () => this.state.isLoggedIn(),

        // Event Handlers ********************************
        refreshOrgsListHandler: <Function>null,
        goNext: <Function>null,
        executeForceOrgListHandler: <Function>null,
        executeForceOrgDisplayHandler: <Function>null,
        downloadCLICommadOutputHandler: <Function>null
    };

    configPage = {

        // Fields ********************************
        allConfigIds: new Array<string>(),
        allSObjectIds: new Array<string>(),
        currentSObjectId: <string>null,
        objectEditData: new ObjectEditData(),
        isComplexExternalIdEditMode: false,
        availableTargetSObjectNamesForFieldMapping: new Array<FieldItem>(),
        availableTargetSFieldsNamesForFieldMapping: new Array<FieldItem>(),
        selectedFieldNameForMock: "",



        // Methods / Properties ********************************
        isValid: () => {
            return this.state.config().isValid();
        },
        isShown: () => this.state.sourceOrg().sourceType != SOURCE_TYPE.Unknown
            && this.state.targetOrg().sourceType != SOURCE_TYPE.Unknown,
        availableSObjects: (): SObjectDescribe[] => {
            if (!this.state.config()) return new Array<SObjectDescribe>();
            return AppUtils.exclude(this.state.availableSObjects(), this.state.config().objects, "name");
        },
        showRemoveUnusedConfigFildersButton: (): boolean => {
            let folders = AppUtils.getListOfDirs(this.state.userData.basePath);
            let toDelete = folders.filter(folder => {
                if (!folder.name.startsWith('_')) {
                    if (!this.state.configs().map(c => c.name).some(x => folder.name == x)) {
                        return true;
                    }
                }
            }).map(folder => folder.fullPath);
            return toDelete.length > 0;
        },

        _operationList: <Array<SelectItem>>null,
        operationList: (): SelectItem[] => {
            if (!this.configPage._operationList) {
                this.configPage._operationList = AppUtils.listEnum(OPERATION)
                    .filter(item => item != OPERATION[OPERATION.Unknown])
                    .map(item => new SelectItem({
                        value: item,
                        text: item
                    }));
            }
            return this.configPage._operationList;
        },
        getObjectQuickInfoString: (objectIndex: number): string => {
            let scriptObject = this.state.config().objects[objectIndex];
            return `${scriptObject.master ? RESOURCES.Config_MasterTag 
                + ' | ' : ''}${scriptObject.operation} | ${scriptObject.externalId}${scriptObject.deleteOldData ? ' | ' + RESOURCES.Config_DeleteOldDataTag : ''}`;
        },
        disableAddNewFieldMappingItemButton: () => {
            return this.state.sobject().fieldMapping.length > 0
                && (!this.state.sobject().targetSobjectNameForFieldMapping
                    || this.state.sobject().fieldMapping.some(fieldMapping =>
                        (!fieldMapping.sourceField || !fieldMapping.targetField) && !fieldMapping.targetObject));
        },


        // Event Handlers ********************************
        goNext: <Function>null,
        switchOrgsHandler: <Function>null,
        addConfigClickHandler: <Function>null,
        editConfigClickHandler: <Function>null,
        cloneConfigClickHandler: <Function>null,
        uploadConfigChangeHandler: <Function>null,
        downloadConfigClickHandler: <Function>null,
        removeConfigClickHandler: <Function>null,
        addObjectsClickHandler: <Function>null,
        selectObjectClickHandler: <Function>null,
        addRemoveObjectFieldsHandler: ($scope: IAngularScope, $new: Array<ScriptObjectField>, $element: JQuery) => {
            let list1 = $new.map(field => { return { name: field.name }; });
            let list2 = this.state.sobject().fields.map(field => { return { name: field.name }; });
            if (!AppUtils.isEquals(list1, list2)) {
                this.controller.addRemoveObjectFieldsHandler($scope, $new.map(field => new ScriptObjectField(field)), $element);
            }
        },
        addRemoveObjectExcludedFieldsHandler: ($scope: IAngularScope, $new: Array<FieldItem>, $element: JQuery) => {
            let list1 = $new.map(field => field.name);
            let list2 = this.state.sobject().excludedFields;
            if (!AppUtils.isEquals(list1, list2)) {
                this.controller.addRemoveObjectExcludedFieldsHandler($scope, $new, $element);
            }
        },
        removeUnusedConfigFoldersHandler: <Function>null,
        updateSObjectQueryHandler: <Function>null,
        executeTestQueryHandler: <Function>null,
        saveConfigParameterHandler: <Function>null,
        saveConfigParameterDelayedHandler: <Function>null,
        polymorphicFieldChangedHandler: <Function>null,
        externalIdEnterModeChangeHandler: <Function>null,
        upDownObjectHandler: <Function>null,
        removeObjectHandler: <Function>null,
        saveConfigHandler: <Function>null,
        saveConfigDelayedHandler: <Function>null,
        addFieldMappingHandler: <Function>null,
        removeFieldMappingHandler: <Function>null,
        fieldMappingChangedHandler: <Function>null,
        fieldMappingInitializeHandler: <Function>null,
        validateConfigurationHandler: <Function>null,
        reconnectOrgsHandler: <Function>null,
        addMockingItemHandler: <Function>null,
        removeMockingItemHandler: <Function>null,
        updateFieldItems: () => {
            // availableTargetSObjectNamesForFieldMapping -------------- //
            this.configPage.availableTargetSObjectNamesForFieldMapping = AppUtils.uniqueArray(
                this.state.orgs()
                    .filter(org => org.media == DATA_MEDIA_TYPE.Org)
                    .reduce((acc, org) => {
                        if (org.isDescribed) {
                            acc = acc.concat(org.objects.map(object => object.name));
                        }
                        return acc;
                    }, []))
                .sort()
                .map(value => new FieldItem({
                    name: value
                }));

            // availableTargetSFieldsNamesForFieldMapping --------------- //
            let targetObject = this.state.sobject().targetSobjectNameForFieldMapping;
            if (targetObject) {
                this.configPage.availableTargetSFieldsNamesForFieldMapping = AppUtils.uniqueArray(
                    this.state.orgs()
                        .filter(org => org.media == DATA_MEDIA_TYPE.Org)
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
                    .map(value => new FieldItem({
                        name: value
                    }));
            }
        }

    };

    previewPage = {

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
                ? CONSTANTS.MIGRATION_DIRECTIONS.filter(item => item.value != MIGRATION_DIRECTION[MIGRATION_DIRECTION.Orgs])
                : CONSTANTS.MIGRATION_DIRECTIONS;
        },
        migrationDirectionSelectorIsDisabled: (): boolean => {
            return this.state.hasFileSource();
        },
        getSelectedMigrationDirectionEnum: (): MIGRATION_DIRECTION => {
            return MIGRATION_DIRECTION[this.previewPage.selectedMigrationDirection]
        },
        getCLICommandString: (): string => {
            if (!this.state.config().isInitialized()) {
                return "";
            }
            let useFileSource = this.previewPage.getSelectedMigrationDirectionEnum() == MIGRATION_DIRECTION.File2Org;
            let useFileTarget = this.previewPage.getSelectedMigrationDirectionEnum() == MIGRATION_DIRECTION.Org2File;
            return `sfdx sfdmu:run --sourceusername ${useFileSource ? "csvfile" : this.state.sourceOrg().name} --targetusername ${useFileTarget ? "csvfile" : this.state.targetOrg().name} --path ${this.state.config().exportJsonFilepath} --verbose`;
        },


        // Event Handlers ********************************
        generateExportJsonHandler: <Function>null,
        copyCLICommandStringToClipboardHandler: <Function>null,
        goNext: <Function>null
    };

    executePage = {

        // Fields ********************************

        allowShowing: false,
        executeLogHtml: <string>null,

        // Methods / Properties ********************************
        isShown: () => {
            return this.previewPage.isShown() && (this.executePage.allowShowing || this.state.scriptIsExecuting);
        },

        // Event Handlers ********************************
        getCLICommandString: this.previewPage.getCLICommandString,
    };


    /////////////////////////////////////
    // Other ////////////////////////////
    /////////////////////////////////////

    get externalId(): string[] {
        return [this.state.sobject().externalId];
    }
    set externalId(value: string[]) {
        this.state.sobject().externalId = value[0];
    }
}