
import { IDirective, IScope, ITimeoutService } from 'angular';
import bootstrap from 'bootstrap';
import { IAngularService, IJsonEditModalService, ITranslationService } from '../../../angular-app/services';
import { IActionEventArgs, JSONEditor } from '../../../models';
import { AngularUtils } from '../../../utils';



export interface IUIJsonEditorModalScope extends IScope {
	schema: any;
	data: any;
	title: string;
	subTitle: string;
	helpSearchWord: string;
	helpSearchConfigKey: string;
	validationErrorMessage: string;
	error: string;
	show: boolean;
	onClose: (args: IActionEventArgs<IUIJsonEditorOnCloseArgs>) => void;
	closeJsonEditor: (args: IActionEventArgs<boolean>) => void;
	validateCallback: () => boolean;
	validate: UIJsonEditorValidateCallback;
}

export interface IUIJsonEditorOnCloseArgs {
	data: any;
	result: boolean;
}

export interface IUIJsonEditorOnChangeArgs {
	data: any;
	isValid: boolean;
}

/**
 * Callback function for validating the JSON data.
 * @param data The JSON data to validate.
 * @returns An error message if the data is invalid, otherwise nothing.
 */
export type UIJsonEditorValidateCallback = (data: any) => string | void;

export function UiJsonEditorModalDirective(
	$jsonEditModal: IJsonEditModalService,
	$translate: ITranslationService,
	$angular: IAngularService,
	$timeout: ITimeoutService): IDirective {
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
		link: function ($scope: IUIJsonEditorModalScope) {

			let editor: JSONEditor;

			$jsonEditModal.registerJsonEditModalDirective($scope);

			const destroyEditor = () => {
				if (editor) {
					editor.destroy();
				}
			}

			let editorHolderHtmlElement: HTMLElement;

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
			}

			$scope.onModalClose = (args: IActionEventArgs<boolean>) => {
				$scope.onClose({
					args: {
						args: [{
							data: editor.getValue(),
							result: args.args[0]
						}]
					}
				});
				destroyEditor();
			}

			$scope.validateCallback = () => {
				const validate = () => {
					$scope.error = '';
					const errors = editor.validateEditor();
					if (errors.length) {
						$scope.error = $translate.translate({ key: 'JSON_EDITOR_VALIDATION_ERROR' })
							+ '<br />'
							+ errors.map((error) =>
								`<strong>${$jsonEditModal.getHumanReadableJsonPath(error.path, editor)}:</strong> ${error.message}`)
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
				AngularUtils.$apply($scope);
				return isValid;
			}

			const setupEditor = () => {
				$timeout(() => {
					setButtonStyle();
					setTooltips();
					setHelpArticles();
				}, 100);
			}

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
					new bootstrap.Tooltip(element, options);
				});

			}

			const setHelpArticles = () => {
				editorHolderHtmlElement.querySelectorAll(".form-group > .form-label[for^='root[']:not(:has(+ui-label))").forEach((label: HTMLElement) => {
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
	}
}



