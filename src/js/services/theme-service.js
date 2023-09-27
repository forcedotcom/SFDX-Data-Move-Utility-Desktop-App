"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeService = void 0;
const _1 = require(".");
const common_1 = require("../common");
const utils_1 = require("../utils");
const log_service_1 = require("./log-service");
/**
 * Service for managing UI themes.
 */
class ThemeService {
    /**
     * Creates an instance of ThemeService.
     * @param {string} themeBaseUrl - The base URL for the theme CSS files.
     * @param {string} themeLinkSelector - The CSS selector for the theme link element.
     * @param {string[]} availableThemes - The array of available theme names.
     */
    constructor(themeBaseUrl, themeLinkSelector, availableThemes) {
        this.themeBaseUrl = themeBaseUrl;
        this.themeLinkSelector = themeLinkSelector;
        this.availableThemes = availableThemes;
        this.currentTheme = '';
    }
    /**
     * Sets the current theme.
     * @param {string} name - The name of the theme to set.
     * @param {boolean} [isRtl=false] - Indicates whether the theme is for right-to-left (RTL) language support.
     */
    setTheme(name, isRtl = false) {
        if (this.availableThemes.length && !this.availableThemes.includes(name)) {
            return;
        }
        if (name === this.currentTheme && isRtl === this.currentRtl) {
            return;
        }
        const themeUrl = `${this.themeBaseUrl}/${name}/bootstrap${isRtl ? '.rtl' : ''}.css`;
        document.querySelector(this.themeLinkSelector).setAttribute('href', themeUrl);
        document.querySelector('html').setAttribute('data-theme', name);
        this.currentTheme = name;
        this.currentRtl = isRtl;
        log_service_1.LogService.info(`Active theme set to "${name}, isRtl: ${isRtl}"`);
    }
    /**
     * Retrieves the current theme.
     * @returns {string} The name of the current theme.
     */
    getTheme() {
        return this.currentTheme;
    }
    /**
     * Retrieves the available themes.
     * @returns {string[]} An array of available theme names.
     */
    getAvailableThemes() {
        return [...this.availableThemes];
    }
    /* #region Application Helper Methods */
    /** Sets up the current theme.
    *  @param {string} [theme] - The theme to set.
    */
    static setTheme(theme) {
        theme || (theme = global.appGlobal.packageJson.appConfig.theme);
        const availableThemes = utils_1.FsUtils.getDirectories(common_1.CONSTANTS.THEMES_HREF);
        global.appGlobal.themeService = new ThemeService(common_1.CONSTANTS.THEMES_HREF, '[data-bootstrap]', availableThemes);
        global.appGlobal.themeService.setTheme(theme, _1.TranslationService.activeLanguageRtl);
    }
}
exports.ThemeService = ThemeService;
//# sourceMappingURL=theme-service.js.map