"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationService = void 0;
const fs = __importStar(require("fs"));
const common_1 = require("../common");
const services_1 = require("../services");
const utils_1 = require("../utils");
const configurations_1 = require("../configurations");
/**  Translation service for translating text. */
class TranslationService {
    /**
     * Loads the translation for the specified language.
     * If translation is already loaded, returns the loaded translation.
     * If the translation is failed loading, returns the fallback translation instead.
     * @param lang - The language code.
     * @returns The loaded translatiozns.
     */
    static loadTranslation(lang) {
        var _a;
        (_a = global.appGlobal).translations || (_a.translations = {});
        if (global.appGlobal.translations[lang]) {
            return global.appGlobal.translations[lang];
        }
        const path = utils_1.AppUtils.getAppPath(common_1.AppPathType.i18nPath, `${lang}.json`);
        try {
            if (fs.existsSync(path)) {
                const json = fs.readFileSync(path, {
                    encoding: 'utf8'
                });
                const translations = JSON.parse(json || '{}');
                global.appGlobal.translations[lang] = translations;
                return translations;
            }
        }
        catch (ex) {
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
    static setActiveLanguage(lang) {
        TranslationService._activeLanguage = lang;
        services_1.LocalStateService.setLocalState(common_1.CONSTANTS.LOCAL_STATE_KEYS.ActiveLanguage, lang);
        services_1.BroadcastService.broadcastAction('setLanguage', '$translate', {
            args: [lang]
        });
        // Translate Json Editor
        TranslationService._translateJsonEditor(lang);
        // Translate Json Schema Descriptions
        Object.keys(configurations_1.addOnsJsonSchemaConfig).forEach(schema => {
            TranslationService._translateJsonSchemaDescriptions('ADD_ON_MODULE_EDITOR_CONFIG', schema, configurations_1.addOnsJsonSchemaConfig[schema], lang);
        });
        services_1.LogService.info(`Active language set to ${lang}`);
    }
    /**
     * Gets the active language from the local state.
     * Overrides the active language in the _activeLanguage variable.
     * @returns The active language.
     */
    static getActiveLanguage() {
        return (TranslationService._activeLanguage = services_1.LocalStateService.getLocalState(common_1.CONSTANTS.LOCAL_STATE_KEYS.ActiveLanguage, global.appGlobal.packageJson.appConfig.fallbackLocale));
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
        return utils_1.AppUtils.isRtl(TranslationService.activeLanguage);
    }
    // Instance members ----------------------------------------------------------
    /**
     * Instance method that translates a text based on the provided arguments.
     * @param args - The translation function arguments.
     * @returns {string} The translated text.
     */
    translate(args) {
        return TranslationService.translate(args);
    }
    /**
     * Instance method that sets the active language to the local state.
     * @param lang - The language code.
     */
    setActiveLanguage(lang) {
        TranslationService.setActiveLanguage(lang);
    }
    /**
     * Instance method that gets the active language from the local state.
     * @returns {string} The active language.
     */
    getActiveLanguage() {
        return TranslationService.getActiveLanguage();
    }
    /**
     * Instance method that gets the current active language from the cache variable.
     * @returns {string} The active language.
     */
    get activeLanguage() {
        return TranslationService.activeLanguage;
    }
    /**
     * Instance method that gets the current active language direction.
     * @returns {boolean} True if the active language is RTL, false otherwise.
     */
    get activeLanguageRtl() {
        return TranslationService.activeLanguageRtl;
    }
    /* #region Application Helper Methods */
    /**
     * Sets up the current language
     * @param {string} [language] - The language to set.
     */
    static setLanguage(language) {
        language || (language = TranslationService.getActiveLanguage());
        TranslationService.setActiveLanguage(language);
        global.appGlobal.activeLang = language;
        global.appGlobal.activeLangRtl = TranslationService.activeLanguageRtl;
        document.querySelector('html').setAttribute('lang', language);
        document.querySelector('html').setAttribute('dir', TranslationService.activeLanguageRtl ? 'rtl' : 'ltr');
        document.querySelector('link[data-app]').setAttribute('href', TranslationService.activeLanguageRtl ? './css/app.rtl.css' : './css/app.css');
    }
    /* #endregion */
    /* #region Private Methods */
    /**
     * Translates JSON schema titles and descriptions based on the specified language.
     * @param rootTranslationKey The root key for the translation entries.
     * @param jsonSchemaKey The specific key for the JSON schema being translated.
     * @param jsonSchema The JSON schema object to be translated.
     * @param lang The language code to use for translations.
     */
    static _translateJsonSchemaDescriptions(rootTranslationPrefix, jsonSchemaKey, jsonSchema, lang) {
        jsonSchema.title = TranslationService.translate({ key: `${rootTranslationPrefix}.title` });
        jsonSchema.description = TranslationService.translate({ key: `${rootTranslationPrefix}.description` });
        TranslationService._translateJsonSchemaRecursive(rootTranslationPrefix, jsonSchemaKey, jsonSchema, lang);
    }
    /**
     * Recursively translates descriptions of JSON schema properties.
     * @param rootTranslationKey The base translation key for accessing translations.
     * @param jsonSchemaKey The key corresponding to the current level of the JSON schema.
     * @param jsonSchema The JSON schema object or property to be translated.
     * @param lang The language to use for translation.
     */
    static _translateJsonSchemaRecursive(rootTranslationKey, jsonSchemaKey, jsonSchema, lang) {
        Object.keys(jsonSchema.properties || {}).forEach((key) => {
            const property = jsonSchema.properties[key];
            const finalKey = `${rootTranslationKey}.${jsonSchemaKey}.${key}`;
            const translation = TranslationService.translate({ key: finalKey, lang });
            property.description = finalKey == translation ? "" : translation;
            if (property.properties) {
                this._translateJsonSchemaRecursive(rootTranslationKey, jsonSchemaKey, property, lang);
            }
            else if (property.items) {
                this._translateJsonSchemaRecursive(rootTranslationKey, jsonSchemaKey, property.items, lang);
            }
        });
    }
    /**
     * Configures the JSON Editor's language settings based on the specified language.
     * @param lang The language code to apply to the JSON Editor.
     */
    static _translateJsonEditor(lang) {
        if (window) {
            window.JSONEditor.defaults.languages[lang] = window.JSONEditor.defaults.languages[lang]
                || TranslationService.translate({ key: 'JSON_EDITOR_TRANSLATION', lang });
            window.JSONEditor.defaults.language = lang;
        }
    }
}
exports.TranslationService = TranslationService;
// Static members ------------------------------------------------------------
/**
* Translates a text based on the provided arguments.
* If translation for teh given language is already loaded, returns the loaded translation,
* otherwise loads the translation for the given language from the file system and returns it.
* Uses _activeLanguage as  a current language if lang is not provided.
* @param args - The translation function arguments.
* @returns The translated text.
*/
TranslationService.translate = (args) => {
    // Check if language is provided, otherwise use the active language
    if (!args.lang) {
        if (!TranslationService._activeLanguage) {
            args.lang = TranslationService.getActiveLanguage();
        }
        else {
            args.lang = TranslationService._activeLanguage;
        }
    }
    // Load translation for the given language  
    TranslationService.loadTranslation(args.lang);
    // Get the text from the translations
    let text = utils_1.CommonUtils.getObjectValueByPath(global.appGlobal.translations[args.lang] || {}, args.key) || '';
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
        const md = new services_1.MarkdownService();
        text = md.render(text);
    }
    // Return the translated text
    return text || args.key;
};
//# sourceMappingURL=translation-service.js.map