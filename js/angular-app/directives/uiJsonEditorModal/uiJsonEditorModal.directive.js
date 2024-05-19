"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiJsonEditorModalDirective = void 0;
const bootstrap_1 = __importDefault(require("bootstrap"));
const utils_1 = require("../../../utils");
function UiJsonEditorModalDirective($jsonEditModal, $translate, $angular, $timeout) {
    return {
        restrict: 'E',
        scope: {
            schema: '<',
            data: '<',
            onClose: '&',
            title: '@',
            subTitle: '@',
            helpSearchWord: '@',
            helpSearchConfigKey: '@',
            validationErrorMessage: '@',
            show: '<',
            validate: '<'
        },
        template: `
		<ui-content-dialog show="show" 
					ok-button-key="SAVE"
					on-modal-close="onModalClose(args)" 
					on-modal-show="onModalShow()"
					show-cancel="true" 
					full-width="true"
					modal-body-class="pt-0"
					validation-error-message="{{ validationErrorMessage }}"
					validate-callback="validateCallback">
			<modal-header>
				<ui-label ng-if="title" label="{{ 'JSON_EDITOR_TITLE' | translate : { title } }}" 
							help-search-word="{{ helpSearchWord }}"
							add-help-links="!!helpSearchWord"
							class="d-block">
				</ui-label>					
			</modal-header>
			<modal-body>
				<small ng-if="subTitle" ng-bind-html="subTitle" class="text-muted"></small>			
				<small id="error_message" class="text-danger ng-binding d-block pb-3" ng-bind-html="error"></small>
				<div id="editor_holder"></div>
			</modal-body>
		</ui-content-dialog>
	`,
        link: function ($scope) {
            let editor;
            $jsonEditModal.registerJsonEditModalDirective($scope);
            const destroyEditor = () => {
                if (editor) {
                    editor.destroy();
                }
            };
            let editorHolderHtmlElement;
            $scope.onModalShow = () => {
                $scope.schema = $scope.schema || {};
                $scope.schema.formNameRoot = $scope.schema.formNameRoot || 'root';
                destroyEditor();
                editorHolderHtmlElement = document.getElementById('editor_holder');
                editor = new window.JSONEditor(editorHolderHtmlElement, {
                    theme: 'bootstrap5',
                    iconlib: "fontawesome5",
                    schema: $scope.schema,
                    no_additional_properties: true,
                    disable_array_delete_all_rows: true,
                    disable_array_delete_last_row: true,
                    remove_button_labels: true,
                    enforce_const: true,
                    button_state_mode: 1,
                    array_controls_top: true,
                    disable_edit_json: true,
                    disable_properties: true,
                    object_layout: 'grid',
                    show_opt_in: true,
                    prompt_paste_max_length_reached: true,
                    show_errors: "always",
                    form_name_root: $scope.schema.formNameRoot
                });
                editor.on('ready', () => {
                    $scope.$apply(() => {
                        $scope.error = '';
                        editor.setValue($scope.data || {});
                        editor.validate();
                    });
                    setupEditor();
                });
                editor.on('change', () => {
                    $scope.validateCallback();
                    setupEditor();
                });
            };
            $scope.onModalClose = (args) => {
                $scope.onClose({
                    args: {
                        args: [{
                                data: editor.getValue(),
                                result: args.args[0]
                            }]
                    }
                });
                destroyEditor();
            };
            $scope.validateCallback = () => {
                const validate = () => {
                    $scope.error = '';
                    const errors = editor.validateEditor();
                    if (errors.length) {
                        $scope.error = $translate.translate({ key: 'JSON_EDITOR_VALIDATION_ERROR' })
                            + '<br />'
                            + errors.map((error) => `<strong>${$jsonEditModal.getHumanReadableJsonPath(error.path, editor)}:</strong> ${error.message}`)
                                .join('<br />');
                        return false;
                    }
                    const validateError = $scope.validate && $scope.validate(editor.getValue());
                    if (validateError) {
                        $scope.error = validateError;
                        return false;
                    }
                    return true;
                };
                const isValid = validate();
                utils_1.AngularUtils.$apply($scope);
                return isValid;
            };
            const setupEditor = () => {
                $timeout(() => {
                    setButtonStyle();
                    setTooltips();
                    setHelpArticles();
                }, 100);
            };
            const setButtonStyle = () => {
                editorHolderHtmlElement.querySelectorAll('.json-editor-btn-add, .json-editor-btntype-move').forEach(element => {
                    element.classList.remove('btn-secondary', 'btn-outline-primary');
                    element.classList.add('btn-outline-primary');
                });
                editorHolderHtmlElement.querySelectorAll('.json-editor-btn-delete, .json-editor-btn-subtract').forEach(element => {
                    element.classList.remove('btn-secondary', 'btn-outline-danger');
                    element.classList.add('btn-outline-danger');
                });
                editorHolderHtmlElement
                    .querySelectorAll('[data-schematype="array"] > .card > div > [data-schematype="object"]')
                    .forEach(arrayItemContainer => {
                    const buttonGroupElement = arrayItemContainer.querySelector(':scope > .btn-group:not(.je-object__controls)');
                    const titleElement = arrayItemContainer.querySelector(':scope > .je-object__title');
                    titleElement.after(buttonGroupElement);
                });
            };
            const setTooltips = () => {
                editorHolderHtmlElement.querySelectorAll('[title]').forEach(element => {
                    const options = {
                        title: element.getAttribute('title'),
                        html: true
                    };
                    new bootstrap_1.default.Tooltip(element, options);
                });
            };
            const setHelpArticles = () => {
                editorHolderHtmlElement.querySelectorAll(".form-group > .form-label[for^='root[']:not(:has(+ui-label))").forEach((label) => {
                    const fieldPath = label.getAttribute('for');
                    let fieldName = fieldPath.replace(/^.*\[([\w\d]+)\]$/, '$1');
                    if (!isNaN(+fieldName)) {
                        fieldName = fieldPath.replace(/^.*\[([\w\d]+)\]\[\d+\]$/, '$1');
                    }
                    const helpSearchWord = `${$scope.helpSearchConfigKey}.${fieldName}`;
                    $angular.addHelpLink($scope, label, helpSearchWord, false);
                });
            };
        }
    };
}
exports.UiJsonEditorModalDirective = UiJsonEditorModalDirective;
//# sourceMappingURL=uiJsonEditorModal.directive.js.map