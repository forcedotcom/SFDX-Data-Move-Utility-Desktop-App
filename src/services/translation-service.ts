import * as fs from 'fs';
import { AppPathType, CONSTANTS } from '../common';
import { TranslateFnArgs } from '../models';
import { BroadcastService, LocalStateService, LogService, MarkdownService } from '../services';
import { AppUtils, CommonUtils } from '../utils';




/**  Translation service for translating text. */
export class TranslationService {

    // The active language
    // This variable uses as a cache for the active language to avoid unnecessary loading of the active language from the local state.
    private static _activeLanguage: string;



    // Static members ------------------------------------------------------------
    /**
    * Translates a text based on the provided arguments.
    * If translation for teh given language is already loaded, returns the loaded translation, 
    * otherwise loads the translation for the given language from the file system and returns it.     
    * Uses _activeLanguage as  a current language if lang is not provided.
    * @param args - The translation function arguments.
    * @returns The translated text.
    */
    static translate = (args: TranslateFnArgs): string => {

        // Check if language is provided, otherwise use the active language
        if (!args.lang) {
            if (!TranslationService._activeLanguage) {
                args.lang = TranslationService.getActiveLanguage();
            } else {
                args.lang = TranslationService._activeLanguage;
            }
        }

        // Load translation for the given language  
        TranslationService.loadTranslation(args.lang);

        // Get the text from the translations
        let text = CommonUtils.getObjectValueByPath(global.appGlobal.translations[args.lang] || {}, args.key) as string || '';

        if (!text) {
            // Use fallback language if translation is not found and the current language is not the fallback language
            if (args.lang !== global.appGlobal.packageJson.appConfig.fallbackLocale) {
                text = TranslationService.translate({
                    ...args,
                    lang: global.appGlobal.packageJson.appConfig.fallbackLocale
                });
            }
        }

        // Replace parameters in the text
        if (args.params) {
            for (const param in args.params) {
                text = text.replace(new RegExp(`{{\\s*${param}\\s*}}`, 'g'), args.params[param]);
            }
        }

        // Render the text as markdown if needed
        if (args.useMarkdownFormat) {
            const md = new MarkdownService();
            text = md.render(text);
        }

        // Return the translated text
        return text || args.key;
    };

    /**
     * Loads the translation for the specified language.
     * If translation is already loaded, returns the loaded translation.
     * If the translation is failed loading, returns the fallback translation instead.
     * @param lang - The language code.
     * @returns The loaded translatiozns.
     */
    static loadTranslation(lang: string): any {
        global.appGlobal.translations ||= {};
        if (global.appGlobal.translations[lang]) {
            return global.appGlobal.translations[lang];
        }
        const path = AppUtils.getAppPath(AppPathType.i18nPath, `${lang}.json`);
        try {
            if (fs.existsSync(path)) {
                const json = fs.readFileSync(path, {
                    encoding: 'utf8'
                });
                const translations = JSON.parse(json || '{}');
                global.appGlobal.translations[lang] = translations;
                return translations;
            }
        } catch (ex) {
        }
        const translate = TranslationService.loadTranslation(global.appGlobal.packageJson.appConfig.fallbackLocale);
        global.appGlobal.translations[lang] = translate;
        return translate;
    }

    /**
     * Sets the active language to the local state.
     * Overrides the active language in the _activeLanguage variable.
     * @param lang - The language code.
     */
    static setActiveLanguage(lang: string) {
        TranslationService._activeLanguage = lang;
        LocalStateService.setLocalState(CONSTANTS.LOCAL_STATE_KEYS.ActiveLanguage, lang);
        BroadcastService.broadcastAction('setLanguage', '$translate', {
            args: [lang]
        });
        LogService.info(`Active language set to ${lang}`);
    }

    /**
     * Gets the active language from the local state.
     * Overrides the active language in the _activeLanguage variable.
     * @returns The active language.
     */
    static getActiveLanguage(): string {
        return (TranslationService._activeLanguage = LocalStateService.getLocalState(
            CONSTANTS.LOCAL_STATE_KEYS.ActiveLanguage,
            global.appGlobal.packageJson.appConfig.fallbackLocale
        ));
    }

    /**
     * Gets the current active language from the cache variable.
     */
    static get activeLanguage() {
        return TranslationService._activeLanguage;
    }

    /**
     * Gets the current active language direction.
     * @returns True if the active language is RTL, false otherwise.
     */
    static get activeLanguageRtl() {
        return AppUtils.isRtl(TranslationService.activeLanguage);
    }



    // Instance members ----------------------------------------------------------
    /**
     * Instance method that translates a text based on the provided arguments.
     * @param args - The translation function arguments.
     * @returns {string} The translated text.
     */
    translate(args: TranslateFnArgs): string {
        return TranslationService.translate(args);
    }

    /**
     * Instance method that sets the active language to the local state.
     * @param lang - The language code.
     */
    setActiveLanguage(lang: string) {
        TranslationService.setActiveLanguage(lang);
    }

    /**
     * Instance method that gets the active language from the local state.
     * @returns {string} The active language.
     */
    getActiveLanguage(): string {
        return TranslationService.getActiveLanguage();
    }

    /**
     * Instance method that gets the current active language from the cache variable.
     * @returns {string} The active language.
     */
    get activeLanguage(): string {
        return TranslationService.activeLanguage;
    }

    /**
     * Instance method that gets the current active language direction.
     * @returns {boolean} True if the active language is RTL, false otherwise.
     */
    get activeLanguageRtl(): boolean {
        return TranslationService.activeLanguageRtl;
    }



    /* #region Application Helper Methods */
    /**
     * Sets up the current language
     * @param {string} [language] - The language to set.
     */
    static setLanguage(language?: string) {
        language ||= TranslationService.getActiveLanguage();
        TranslationService.setActiveLanguage(language);
        global.appGlobal.activeLang = language;
        global.appGlobal.activeLangRtl = TranslationService.activeLanguageRtl;
        document.querySelector('html').setAttribute('lang', language);
        document.querySelector('html').setAttribute('dir', TranslationService.activeLanguageRtl ? 'rtl' : 'ltr');
        document.querySelector('link[data-app]').setAttribute('href', TranslationService.activeLanguageRtl ? './css/app.rtl.css' : './css/app.css');
    }
    /* #endregion */



}