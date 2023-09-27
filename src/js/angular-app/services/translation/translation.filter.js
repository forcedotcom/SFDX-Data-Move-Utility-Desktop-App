"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationFilter = void 0;
class TranslationFilter {
    constructor($translate) {
        this.$translate = $translate;
    }
    filter(input, args, lang) {
        return this.$translate.translate({ key: input, params: args, lang });
    }
}
exports.TranslationFilter = TranslationFilter;
//# sourceMappingURL=translation.filter.js.map