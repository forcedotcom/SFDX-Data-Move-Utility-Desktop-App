"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationController = void 0;
/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
const common_1 = require("../../common");
const services_1 = require("../../services");
const utils_1 = require("../../utils");
class ConfigurationController {
    constructor($app, $scope) {
        this.$app = $app;
        this.$scope = $scope;
        this.isConfigurationSelected = false;
        this.scriptTabsSelectedTabId = "";
    }
    $onInit() {
        services_1.LogService.info('Initializing ConfigurationController...');
        this.setup();
        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);
    }
    /**
     * Setup the component.
     */
    setup() {
        if (global.appGlobal.wizardStep == ConfigurationController.wizardStep) {
            const config = services_1.DatabaseService.getConfig();
            utils_1.AngularUtils.$apply(this.$scope, () => {
                this.isConfigurationSelected = config.isInitialized;
                this.scriptTabsSelectedTabId = "tabObjectManager";
            });
        }
    }
}
exports.ConfigurationController = ConfigurationController;
ConfigurationController.$inject = ["$app", "$scope"];
ConfigurationController.wizardStep = common_1.WizardStepByView[common_1.View.configuration];
//# sourceMappingURL=configuration.controller.js.map