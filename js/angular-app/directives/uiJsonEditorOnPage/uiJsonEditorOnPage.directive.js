"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiJsonEditorOnPageDirective = void 0;
const utils_1 = require("../../../utils");
function UiJsonEditorOnPageDirective($timeout) {
    return {
        restrict: 'E',
        scope: {
            schema: '=',
            data: '=',
            title: '@',
            subTitle: '@',
            helpSearchWord: '@',
            validate: '=',
            onChange: '&'
        },
        template: `
            <div class="pt-2">
				<ui-label ng-if="title" label="{{ title }}" 
					help-search-word="{{ helpSearchWord }}" 
					add-help-links="!!helpSearchWord" 
					class="d-block">
				</ui-label>
                <small ng-if="subTitle" class="text-muted">{{ subTitle }}</small>
                <div class="text-danger">{{ error }}</div>
                <div id="{{ dynamicId }}" class="pt-2"></div>
            </div>
        `,
        link: function ($scope) {
            let editor;
            $scope.dynamicId = 'json-editor-' + utils_1.CommonUtils.randomString();
            const destroyEditor = () => {
                if (editor) {
                    editor.destroy();
                }
            };
            const initializeEditor = () => {
                destroyEditor(); // Ensure clean setup
                const editorHolderHtmlElement = document.getElementById($scope.dynamicId);
                if (editorHolderHtmlElement && $scope.schema && $scope.data) {
                    editor = new window.JSONEditor(editorHolderHtmlElement, {
                        theme: 'bootstrap5',
                        iconlib: 'fontawesome5',
                        schema: $scope.schema,
                        no_additional_properties: true,
                        remove_button_labels: true,
                        enforce_const: true,
                        show_opt_in: true,
                        show_errors: "always",
                        remove_empty_properties: true,
                        remove_false_properties: true,
                        remove_zero_properties: true,
                        remove_default_properties: true,
                        form_name_root: $scope.schema.formNameRoot
                    });
                    editor.on('ready', () => {
                        editor.setValue($scope.data || {});
                        editor.validate();
                    });
                    editor.on('change', () => {
                        if ($scope.onChange) {
                            $scope.onChange({
                                args: {
                                    arg: {
                                        data: editor.getValue(),
                                        isValid: validate()
                                    }
                                }
                            });
                        }
                    });
                }
            };
            $scope.$on('$destroy', destroyEditor);
            $scope.$watchGroup(['schema', 'data'], (newVals, oldVals) => {
                if (newVals !== oldVals) {
                    initializeEditor();
                }
            });
            $timeout(initializeEditor, 0); // Delay of 0 ms to defer execution until the next digest cycle
            const validate = () => {
                $scope.error = '';
                if (editor.validate().length) {
                    return false;
                }
                const validateError = $scope.validate && $scope.validate(editor.getValue());
                if (validateError) {
                    $scope.error = validateError;
                    return false;
                }
                return true;
            };
        }
    };
}
exports.UiJsonEditorOnPageDirective = UiJsonEditorOnPageDirective;
//# sourceMappingURL=uiJsonEditorOnPage.directive.js.map