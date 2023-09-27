"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngularMarkdownServiceModule = void 0;
const angular_1 = __importDefault(require("angular"));
const _1 = require(".");
exports.AngularMarkdownServiceModule = angular_1.default.module('markdownServiceModule', [])
    .service('$md', function () { return new _1.AngularMarkdownService(); })
    .filter('md', ['$sce', '$md', function ($sce, $md) {
        return function (input) {
            return $sce.trustAsHtml($md.render(input));
        };
    }]);
//# sourceMappingURL=markdown.module.js.map