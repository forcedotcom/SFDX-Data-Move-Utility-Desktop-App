/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
import angular from 'angular';
import { AppController } from '.';

export class AppComponent implements angular.IComponentOptions {
    public controller = AppController;
    public templateUrl = './js/angular-app/components/app/app.html';
    public transclude = {
        header: '?headerPane',
        toolbar: '?toolbarPane',
        body: '?bodyPane',
        footer: '?footerPane',
        leftSidebar: '?leftSidebarPane',
        rightSidebar: '?rightSidebarPane'
    };
}
