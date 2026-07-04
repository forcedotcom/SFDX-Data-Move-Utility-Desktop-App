/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
import angular from 'angular';
import { ObjectManagerEditorController } from './objectManagerEditor.controller';

export class ObjectManagerEditorComponent implements angular.IComponentOptions {
    public controller = ObjectManagerEditorController;
    public templateUrl = './js/angular-app/components/objectManagerEditor/objectManagerEditor.html';
    public bindings = {
        // Define your component bindings here
    };
}
