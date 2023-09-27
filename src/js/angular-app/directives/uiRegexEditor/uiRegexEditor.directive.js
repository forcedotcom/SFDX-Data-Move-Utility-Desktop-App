"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiRegexEditorDirectiveModule = void 0;
class UiRegexEditor {
    constructor() {
        this.restrict = 'E';
        this.template = `
            <div>
                <div class="mb-3">
                    <label>Regex Pattern:</label>
                    <div class="input-group">
                        <input type="text" class="form-control" ng-model="pattern" ng-class="{'is-invalid': errorMessage}">
                        <button class="btn btn-sm" ng-click="formatPattern()"><i class="fas fa-cogs"></i></button>
                        <button class="btn btn-sm" ng-click="testPattern()"><i class="fas fa-play"></i></button>
                        <button class="btn btn-sm" ng-click="copyPattern()"><i class="fas fa-copy"></i></button>
                    </div>
                    <div style="display: block !important" class="invalid-feedback">{{errorMessage}}</div>
                </div>
                
                <div class="mb-3">
                    <label>Test String:</label>
                    <input type="text" class="form-control" ng-model="testString">
                </div>

                <div>
                    <label>Result:</label>
                    <span>{{matchResult}}</span>
                </div>
            </div>
        `;
    }
    link($scope) {
        $scope.formatPattern = () => {
            try {
                const regex = new RegExp($scope.pattern);
                $scope.pattern = regex.toString();
                $scope.errorMessage = '';
            }
            catch (error) {
                $scope.errorMessage = error.message;
            }
        };
        $scope.testPattern = () => {
            try {
                const regex = new RegExp($scope.pattern);
                $scope.matchResult = regex.test($scope.testString) ? "Matched" : "Not Matched";
                $scope.errorMessage = '';
            }
            catch (error) {
                $scope.errorMessage = error.message;
            }
        };
        $scope.copyPattern = () => {
            navigator.clipboard.writeText($scope.pattern).then(() => {
                const copyButtonIcon = document.querySelector('.fa-copy');
                if (copyButtonIcon) {
                    copyButtonIcon.classList.remove('fa-copy');
                    copyButtonIcon.classList.add('fa-check');
                    setTimeout(() => {
                        copyButtonIcon.classList.remove('fa-check');
                        copyButtonIcon.classList.add('fa-copy');
                    }, 3000);
                }
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        };
    }
    static factory() {
        return () => new UiRegexEditor();
    }
}
exports.uiRegexEditorDirectiveModule = angular.module('uiRegexEditorDirectiveModule', [])
    .directive('uiRegexEditor', UiRegexEditor.factory());
//# sourceMappingURL=uiRegexEditor.directive.js.map