"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonEditModalService = void 0;
const utils_1 = require("../../../utils");
/**
 * Service for managing JSON edit modals.
 */
class JsonEditModalService {
    /**
     * Constructor for JsonEditModalService.
     */
    constructor() { }
    registerJsonEditModalDirective($scope) {
        this.$scope = $scope;
    }
    async editJsonAsync(json, jsonSchema, validateCallback, validationErrorMessage) {
        jsonSchema = utils_1.CommonUtils.deepClone(jsonSchema);
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
        });
        return new Promise((resolve) => {
            this.$scope.onClose = (args) => {
                this.$scope.show = false;
                resolve(args.args.args[0]);
            };
        });
    }
    getHumanReadableJsonPath(jsonPath, editor) {
        const pathParts = jsonPath ? jsonPath.split('.') : [];
        let actualPath = '';
        return pathParts.reduce((acc, currentProp, index) => {
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
exports.JsonEditModalService = JsonEditModalService;
//# sourceMappingURL=jsonEditModalService.service.js.map