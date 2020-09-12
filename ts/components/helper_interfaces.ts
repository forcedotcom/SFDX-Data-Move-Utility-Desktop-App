/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AppUIState } from "./appUIState";
import { SObjectDescribe } from "../models/sobjectDescribe";
import { FieldItem } from "../models/fieldItem";

export interface IDatabaseModel {
    id: string;
}

export interface IAppModel {
    initialize: (init: Partial<any>) => void,
    isValid: () => boolean,
    errorMessage: string
}

export interface ISecuredModel {
    email: string;
    password: string;
    id: string;
    data: string;
    toSecuredObject?: () => ISecuredModel;
    fromSecuredObject?: (securedObject: object, plainPassword: string) => ISecuredModel;
}

export interface IOrgConnectionData {
    instanceUrl: string;
    accessToken: string;
    apiVersion: string;
}

export interface IAngularScope {
    $apply: (arg: any) => any,
    ui: AppUIState,
    res: any,
    $watchCollection: Function,
    $watch: Function
}

export interface IAppSettings {
    app_title?: string,
    db_name?: string,
    db_path?: string,
    db_basePath?: string,
    db_moveFiles?: boolean,
    isDebug?:boolean,
    version?: string,
    repoUrl?: string,
    packageJsonUrl?: string
}

export interface IPackageJson {
    version: string;
    description: string;
    repository: string;
    package_json: string;
}

export interface IFileEntry {
    name: string;
    fullPath: string;
    isDirectory: boolean;
}

export interface IPolymorphicField {
    name: string;
    referencedToSObjects: SObjectDescribe[];
    referencedTo: string[];
    fieldItem: FieldItem;
    parentSObject: string;
}




