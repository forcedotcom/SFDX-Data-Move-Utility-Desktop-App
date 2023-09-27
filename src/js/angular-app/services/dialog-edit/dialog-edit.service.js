"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dialogEditServiceModule = exports.DialogEditService = void 0;
const angular_1 = __importDefault(require("angular"));
const utils_1 = require("../../../utils");
const bootstrap_1 = __importDefault(require("bootstrap"));
/**
 * Service that displays modal dialogs with various controls.
 */
class DialogEditService {
    constructor($q, $rootScope, $compile, $translate) {
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$compile = $compile;
        this.$translate = $translate;
    }
    showDialogAsync(args) {
        const deferred = this.$q.defer();
        const scope = this.$rootScope.$new(true);
        scope.dialogType = args.dialogType;
        scope.promptMessage = args.promptMessage;
        scope.title = args.title || this.$translate.translate({ key: args.dialogType === 'inputbox' ? 'ENTER_VALUE' : 'SELECT_VALUE' });
        scope.options = args.selectBoxOptions || [];
        scope.isRequired = args.isRequired;
        scope.invalidMessage = args.invalidMessage || this.$translate.translate({ key: 'THIS_FIELD_IS_REQUIRED' });
        scope.inputValue = angular_1.default.copy(args.defaultValue);
        scope.selectedOption = angular_1.default.copy(args.defaultValue);
        const id = utils_1.CommonUtils.randomString();
        scope.validateAndSubmit = function () {
            var _a;
            if (scope.isRequired &&
                (!scope.inputValue && args.dialogType == 'inputbox'
                    || !scope.selectedOption && args.dialogType == 'selectbox'
                    || !((_a = scope.selectedOption) === null || _a === void 0 ? void 0 : _a.length) && args.dialogType == 'multiselect')) {
                scope.showError = true;
            }
            else {
                deferred.resolve(scope.dialogType === 'inputbox' ? scope.inputValue : scope.selectedOption);
                modal.hide();
            }
        };
        const template = `
        <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" ng-bind="title"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p ng-bind="promptMessage"></p>
                        <div ng-show="dialogType === 'inputbox'">
                            <input type="text" class="form-control" ng-model="inputValue">
                        </div>
                        <div ng-show="dialogType === 'selectbox'">
                            <select class="form-select" ng-model="selectedOption">
                                <option ng-repeat="option in options" ng-value="option.value">{{option.label}}</option>
                            </select>
                        </div>
                        <div ng-show="dialogType === 'multiselect'">
                            <ui-multiselect options="options" selected="selectedOption" placeholder="Select Options"></ui-multiselect>
                        </div>
                        <div ng-if="showError" class="text-danger mt-2" ng-bind="invalidMessage"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ 'CANCEL' | translate }}</button>
                        <button type="button" class="btn btn-primary" ng-click="validateAndSubmit()">{{ 'OK' | translate }}</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        const compiledElement = this.$compile(template)(scope);
        angular_1.default.element(document.body).append(compiledElement);
        const modal = new bootstrap_1.default.Modal(document.getElementById(id), {
            backdrop: 'static',
            keyboard: false
        });
        modal.show();
        angular_1.default.element(`#${id}`).on('hidden.bs.modal', function () {
            compiledElement.remove();
            scope.$destroy();
            //deferred.resolve(args.defaultValue as any);
            deferred.resolve(null);
        });
        return deferred.promise;
    }
}
exports.DialogEditService = DialogEditService;
DialogEditService.$inject = ['$q', '$rootScope', '$compile', '$translate'];
// Declare the module
exports.dialogEditServiceModule = angular_1.default.module('dialogEditServiceModule', [])
    .service('$edit', DialogEditService);
//# sourceMappingURL=dialog-edit.service.js.map