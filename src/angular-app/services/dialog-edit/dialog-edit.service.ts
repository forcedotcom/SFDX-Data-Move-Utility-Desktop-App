import angular, { IScope } from 'angular';
import { CommonUtils } from '../../../utils';
import bootstrap from 'bootstrap';
import { TranslationService } from '../../../services';
import { EditDialogArgs } from '../../../common';


/**
 * Service that displays modal dialogs with various controls.
 */
export interface IDialogEditService {
    /**
     * Display a modal dialog.
     * 
     * @param args - Arguments for showing the dialog.
     * @returns A promise that resolves to the user's input or selected option.
     */
    showDialogAsync(args: EditDialogArgs): ng.IPromise<string | string[]>;
}


/**
 * Service that displays modal dialogs with various controls.
 */
export class DialogEditService implements IDialogEditService {

    static $inject = ['$q', '$rootScope', '$compile', '$translate'];

    constructor(
        private $q: ng.IQService,
        private $rootScope: ng.IRootScopeService,
        private $compile: ng.ICompileService,
        private $translate: TranslationService
    ) { }


    showDialogAsync(args: EditDialogArgs): ng.IPromise<string | string[]> {

        const deferred = this.$q.defer<string | string[]>();

        const scope: IScope = this.$rootScope.$new(true);
        scope.dialogType = args.dialogType;
        scope.promptMessage = args.promptMessage;
        scope.title = args.title || this.$translate.translate({ key: args.dialogType === 'inputbox' ? 'ENTER_VALUE' : 'SELECT_VALUE' });
        scope.options = args.selectBoxOptions || [];
        scope.isRequired = args.isRequired;
        scope.invalidMessage = args.invalidMessage || this.$translate.translate({ key: 'THIS_FIELD_IS_REQUIRED' });
        scope.inputValue = angular.copy(args.defaultValue);
        scope.selectedOption = angular.copy(args.defaultValue);

        const id = CommonUtils.randomString();

        scope.validateAndSubmit = function () {
            if (scope.isRequired &&
                (!scope.inputValue && args.dialogType == 'inputbox'
                    || !scope.selectedOption && args.dialogType == 'selectbox'
                    || !scope.selectedOption?.length && args.dialogType == 'multiselect')) {
                scope.showError = true;
            } else {
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
        angular.element(document.body).append(compiledElement);

        const modal = new bootstrap.Modal(document.getElementById(id) as HTMLElement,
            {
                backdrop: 'static',
                keyboard: false
            });

        modal.show();

        angular.element(`#${id}`).on('hidden.bs.modal', function () {
            compiledElement.remove();
            scope.$destroy();
            //deferred.resolve(args.defaultValue as any);
            deferred.resolve(null);
        });

        return deferred.promise;

    }
}

// Declare the module
export const dialogEditServiceModule = angular.module('dialogEditServiceModule', [])
    .service('$edit', DialogEditService);



