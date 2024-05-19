
import { JSONEditor } from '../../../models';
import { IUIJsonEditorModalScope, IUIJsonEditorOnCloseArgs, UIJsonEditorValidateCallback } from '../../../angular-app/directives';
import { CommonUtils } from '../../../utils';


/**
 * Interface for managing JSON edit modals.
 */
export interface IJsonEditModalService {

	/**
	 * Registers the JSON edit modal directive.
	 * @param $scope The scope for the UIJsonEditorModal.
	 */
	registerJsonEditModalDirective($scope: IUIJsonEditorModalScope): void;

	/**
	 * Opens the JSON edit modal asynchronously and returns the edited JSON data.
	 * @param json The JSON data to edit.
	 * @param jsonSchema The JSON schema for validation.
	 * @param validateCallback Optional validation callback.
	 * @param  validationErrorMessage Optional validation error message.
	 * @returns A Promise resolving to the arguments passed when the modal is closed.
	 */
	editJsonAsync(json: any, jsonSchema: any, validateCallback?: UIJsonEditorValidateCallback, validationErrorMessage?: string): Promise<IUIJsonEditorOnCloseArgs>;

	/**
	 * Returns human-readable path instead of full JSON path to the property.
	 * @param jsonPath The full json path to humanize
	 * @param editor The main JSONEditor instance
	 * @returns The human-readable path.
	 */
	getHumanReadableJsonPath(jsonPath: string, editor: JSONEditor): string;

}


/**
 * Service for managing JSON edit modals.
 */
export class JsonEditModalService implements IJsonEditModalService {
	/**
	 * Constructor for JsonEditModalService.
	 */
	constructor() { }

	/**
	 * Scope for the UIJsonEditorModal.
	 */
	private $scope: IUIJsonEditorModalScope;

	registerJsonEditModalDirective($scope: IUIJsonEditorModalScope): void {
		this.$scope = $scope;
	}

	async editJsonAsync(json: any, jsonSchema: any, validateCallback?: UIJsonEditorValidateCallback, validationErrorMessage?: string): Promise<IUIJsonEditorOnCloseArgs> {
		jsonSchema = CommonUtils.deepClone(jsonSchema);
		Object.assign(this.$scope, {
			data: json,
			schema: jsonSchema,
			title: jsonSchema.title,
			subTitle: jsonSchema.description,
			helpSearchWord: jsonSchema.options.helpSearchWord,
			helpSearchConfigKey: jsonSchema.options.helpSearchConfigKey,
			validate: validateCallback,
			validationErrorMessage,
			show: true
		} as IUIJsonEditorModalScope);
		return new Promise<IUIJsonEditorOnCloseArgs>((resolve) => {
			this.$scope.onClose = (args) => {
				this.$scope.show = false;
				resolve(args.args.args[0]);
			}
		});
	}

	getHumanReadableJsonPath(jsonPath: string, editor: JSONEditor): string {
		const pathParts: string[] = jsonPath ? jsonPath.split('.') : [];
		let actualPath = '';
		return pathParts.reduce((acc: string, currentProp: string, index: number) => {
			actualPath += (index > 0 ? `.${currentProp}` : currentProp);
			if (index == 0 || index < pathParts.length - 1 && !isNaN(+pathParts[index + 1])) {
				return acc;
			}
			const currentEditor = editor.getEditor(actualPath);
			const title = currentEditor.schema.title || currentProp;
			return acc ? `${acc} / ${title}` : `${title}`;
		}, '');
	}

}
