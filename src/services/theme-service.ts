import { TranslationService } from ".";
import { CONSTANTS } from "../common";
import { FsUtils } from "../utils";
import { LogService } from "./log-service";

/**
 * Service for managing UI themes.
 */
export class ThemeService {

    private currentTheme: string;
    private currentRtl: boolean;

    /**
     * Creates an instance of ThemeService.
     * @param {string} themeBaseUrl - The base URL for the theme CSS files.
     * @param {string} themeLinkSelector - The CSS selector for the theme link element.
     * @param {string[]} availableThemes - The array of available theme names.
     */
    constructor(private themeBaseUrl: string, private themeLinkSelector: string, private availableThemes: string[]) {
        this.currentTheme = '';
    }

    /**
     * Sets the current theme.
     * @param {string} name - The name of the theme to set.
     * @param {boolean} [isRtl=false] - Indicates whether the theme is for right-to-left (RTL) language support.
     */
    public setTheme(name: string, isRtl = false) {

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

        LogService.info(`Active theme set to "${name}, isRtl: ${isRtl}"`);
    }

    /**
     * Retrieves the current theme.
     * @returns {string} The name of the current theme.
     */
    public getTheme() {
        return this.currentTheme;
    }

    /**
     * Retrieves the available themes.
     * @returns {string[]} An array of available theme names.
     */
    public getAvailableThemes() {
        return [...this.availableThemes];
    }

    /* #region Application Helper Methods */
    /** Sets up the current theme. 
    *  @param {string} [theme] - The theme to set.
    */
    static setTheme(theme?: string) {
        theme ||= global.appGlobal.packageJson.appConfig.theme;
        const availableThemes = FsUtils.getDirectories(CONSTANTS.THEMES_HREF);
        global.appGlobal.themeService = new ThemeService(CONSTANTS.THEMES_HREF, '[data-bootstrap]', availableThemes);
        global.appGlobal.themeService.setTheme(theme, TranslationService.activeLanguageRtl);
    }
    /* #endregion */
}
