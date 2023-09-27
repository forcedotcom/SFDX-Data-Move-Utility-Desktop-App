import { ActionEvent } from "../../../common";

export interface IUiContentDialogScope extends angular.IScope {
    show: boolean;
    onModalClose: ActionEvent<boolean>;
}

class UiContentDialogDirective implements angular.IDirective {
    restrict = 'E';
    transclude = {
        'header': '?modalHeader',
        'body': '?modalBody',
        'footer': '?modalFooter'
    };
    scope = {
        show: '=',
        onModalClose: '&',
        showCancel: '<'
    };
    template = `
            <div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true" ng-class="{show: show}" ng-style="{display: (show ? 'block' : 'none'), 'padding-right': (show ? '17px' : '')}">
                <div class="modal-dialog modal-dialog-scrollable" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modalLabel"><ng-transclude ng-transclude-slot="header"></ng-transclude></h5>
                            <button type="button" class="btn-close" aria-label="Close" ng-click="close(false)"></button>
                        </div>
                        <div class="modal-body">
                            <ng-transclude ng-transclude-slot="body"></ng-transclude>
                        </div>
                        <div class="modal-footer">
                            <ng-transclude ng-transclude-slot="footer"></ng-transclude>
                            <button ng-if="showCancel" type="button" class="btn btn-secondary" ng-click="close(false)">{{ 'CANCEL' | translate }}</button>
                            <button type="button" class="btn btn-primary" ng-click="close(true)">{{ 'OK' | translate }}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

    constructor(private $document: angular.IDocumentService) { }

    link(scope: IUiContentDialogScope): void {
        scope.close = function (isOk: boolean) {
            scope.show = false;
            scope.onModalClose({ args: { args: [isOk] } });
        };

        scope.$watch('show', (newValue: boolean, oldValue: boolean) => {
            if (newValue !== oldValue) {
                if (newValue) {
                    this.$document[0].body.classList.add('modal-open');
                } else {
                    this.$document[0].body.classList.remove('modal-open');
                }
            }
        });
    }

    static factory(): angular.IDirectiveFactory {
        const directive = ($document: angular.IDocumentService) => new UiContentDialogDirective($document);
        directive.$inject = ['$document'];
        return directive;
    }
}

export const uiContentDialogDirectiveModule = angular.module('uiContentDialogDirectiveModule', [])
    .directive('uiContentDialog', UiContentDialogDirective.factory());

