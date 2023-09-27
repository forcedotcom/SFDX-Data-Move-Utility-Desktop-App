"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngularTranslationServiceModule = void 0;
const angular_1 = __importDefault(require("angular"));
const _1 = require(".");
exports.AngularTranslationServiceModule = angular_1.default.module('translationServiceModule', [])
    .service('$translate', function () { return new _1.AngularTranslationService(); })
    .filter('translate', ['$translate', function ($translate) {
        return function (input, args, lang) {
            return new _1.TranslationFilter($translate).filter(input, args, lang);
        };
    }]);
//# sourceMappingURL=translation.module.js.map