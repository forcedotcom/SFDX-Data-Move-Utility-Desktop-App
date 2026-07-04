/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */

import angular from 'angular';
import { ObjectManagerToolbarController } from './objectManagerToolbar.controller';

export class ObjectManagerToolbarComponent implements angular.IComponentOptions {
	public controller = ObjectManagerToolbarController;
	public templateUrl = './js/angular-app/components/objectManagerToolbar/objectManagerToolbar.html';
	public bindings = {};
}