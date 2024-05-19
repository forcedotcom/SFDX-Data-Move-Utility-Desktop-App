"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiContentDialogDirectiveModule = void 0;
const services_1 = require("../../../services");
class UiContentDialogDirective {
    constructor($document) {
        this.$document = $document;
        this.restrict = 'E';
        this.transclude = {
            'header': '?modalHeader',
            'body': '?modalBody',
            'footer': '?modalFooter'
        };
        this.scope = {
            show: '=',
            okButtonKey: '@',
            cancelButtonKey: '@',
            onModalClose: '&',
            onModalShow: '&',
            showCancel: '<',
            modalBodyClass: '@',
            validateCallback: '=',
            validationErrorMessage: '@',
            fullWidth: '<'
        };
        this.template = `
            <div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true" ng-class="{show: show}" ng-style="{display: (show ? 'block' : 'none'), 'padding-right': (show ? '17px' : '')}">
                <div class="modal-dialog modal-dialog-scrollable" role="document">
                    <div class="modal-content" ng-class="{ 'full-width' : fullWidth }">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalLabel"><ng-transclude ng-transclude-slot="header"></ng-transclude></h5>
                            <button type="button" class="btn-close" aria-label="Close" ng-click="close(false)"></button>
                        </div>
                        <div class="modal-body {{ modalBodyClass }}">
                            <ng-transclude ng-transclude-slot="body"></ng-transclude>
                        </div>
                        <div class="modal-footer">
                            <ng-transclude ng-transclude-slot="footer"></ng-transclude>
                            <button ng-if="showCancel" type="button" class="btn btn-secondary" ng-click="close(false)">{{ (cancelButtonKey || 'CANCEL') | translate }}</button>
                            <button type="button" class="btn btn-primary" ng-click="close(true)">{{ (okButtonKey || 'OK') | translate }}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    link($scope) {
        $scope.close = function (isOk) {
            if (isOk) {
                if ($scope.validateCallback) {
                    if (!$scope.validateCallback()) {
                        if ($scope.validationErrorMessage) {
                            services_1.ToastService.showWarn($scope.validationErrorMessage);
                        }
                        return;
                    }
                }
            }
            $scope.show = false;
            $scope.onModalClose({ args: { args: [isOk] } });
        };
        $scope.$watch('show', (newValue, oldValue) => {
            if (newValue !== oldValue) {
                if (newValue) {
                    this.$document[0].body.classList.add('modal-open');
                    if ($scope.onModalShow) {
                        $scope.onModalShow({ args: { args: [] } });
                    }
                }
                else {
                    this.$document[0].body.classList.remove('modal-open');
                }
            }
        });
    }
    static factory() {
        const directive = ($document) => new UiContentDialogDirective($document);
        directive.$inject = ['$document'];
        return directive;
    }
}
exports.uiContentDialogDirectiveModule = angular.module('uiContentDialogDirectiveModule', [])
    .directive('uiContentDialog', UiContentDialogDirective.factory());
//# sourceMappingURL=uiContentDialog.directive.js.map