"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UiLangSwitcherController = void 0;
const services_1 = require("../../../services");
const utils_1 = require("../../../utils");
class UiLangSwitcherController {
    constructor($element, $broadcast) {
        this.$element = $element;
        this.$broadcast = $broadcast;
        this.init();
    }
    init() {
        const availableLangs = global.appGlobal.packageJson.appConfig.locales;
        this.selectSource = availableLangs.map(lang => {
            var _a;
            return {
                code: lang,
                flagClass: `fi fi-${(_a = utils_1.LangUtils.getCountryCode(lang)) === null || _a === void 0 ? void 0 : _a.toLowerCase()}`,
                nativeName: utils_1.LangUtils.getNativeName(lang)
            };
        });
        const activeLanguage = services_1.TranslationService.getActiveLanguage();
        this.selectedLang = this.selectSource.find(lang => lang.code === activeLanguage);
    }
    changeLanguage(langCode) {
        this.selectedLang = this.selectSource.find(lang => lang.code === langCode);
        services_1.TranslationService.setActiveLanguage(langCode);
        this.$broadcast.broadcastAction('onChange', 'uiLangSwitcher', { args: [langCode] });
        if (this.onChange) {
            this.onChange({
                args: {
                    args: [langCode]
                }
            });
        }
    }
    expandDropdown() {
        this.$element.find('.dropdown-toggle, .dropdown-menu').toggleClass('show');
    }
}
exports.UiLangSwitcherController = UiLangSwitcherController;
UiLangSwitcherController.$inject = ['$element', '$broadcast'];
//# sourceMappingURL=uiLangSwitcher.controller.js.map