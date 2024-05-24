"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiJsonEditorDirective = void 0;
const UiJsonEditorDirective = {
    restrict: 'E',
    scope: {
        schema: '=',
        data: '=',
        onClose: '&',
        title: '@',
        show: '='
    },
    template: `
		<ui-content-dialog show="show" 
					on-modal-close="onModalClose(args)" 
					on-modal-show="onModalShow()"
					show-cancel="true" 
					validate-callback="validate">
			<modal-header>
				{{ 'JSON_EDITOR_TITLE' | translate : { title } }}
			</modal-header>
			<modal-body>
				<div id="editor_holder"></div>
			</modal-body>
		</ui-content-dialog>
	`,
    link: function ($scope) {
        let editor;
        const destroyEditor = () => {
            if (editor) {
                editor.destroy();
            }
        };
        $scope.onModalShow = () => {
            destroyEditor();
            const element = document.getElementById('editor_holder');
            editor = new window.JSONEditor(element, {
                theme: 'bootstrap4',
                schema: $scope.schema || {}
            });
            editor.setValue($scope.data || {});
        };
        $scope.onModalClose = (args) => {
            if (args.args[0]) {
                $scope.onClose({
                    args: {
                        args: editor.getValue()
                    }
                });
            }
            destroyEditor();
        };
        $scope.validate = () => {
            const errors = editor.validate();
            return errors.length === 0;
        };
    }
};
exports.UiJsonEditorDirective = UiJsonEditorDirective;
//# sourceMappingURL=uiJsonEditor.directive.js.map