"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownFilter = void 0;
const MarkdownFilter = (markdownService) => {
    return (input) => {
        return markdownService.render(input);
    };
};
exports.MarkdownFilter = MarkdownFilter;
//# sourceMappingURL=markdow.filter.js.map