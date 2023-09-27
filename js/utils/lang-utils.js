"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangUtils = void 0;
class LangUtils {
    /**
     * Get the native name of a language code
     * @param langCode - The language code.
     * @returns The native name of the language.
     * @example LangService.getNativeName('en') // English
     */
    static getNativeName(langCode) {
        const nativeNames = {
            en: 'English',
            es: 'Español',
            fr: 'Français',
            de: 'Deutsch',
            he: 'עברית',
            ar: 'العربية',
            zh: '中文',
            hi: 'हिन्दी, हिंदी',
            ru: 'русский',
            pt: 'Português',
            bn: 'বাংলা',
            id: 'Bahasa Indonesia',
            ja: '日本語',
            fa: 'فارسی',
            pa: 'ਪੰਜਾਬੀ, پنجابی‎',
            jv: 'Basa Jawa',
            mr: 'मराठी',
            te: 'తెలుగు',
            vi: 'Tiếng Việt',
            ko: '한국어',
            ta: 'தமிழ்',
            ur: 'اردو',
            gu: 'ગુજરાતી',
            th: 'ไทย',
            or: 'ଓଡ଼ିଆ',
            tr: 'Türkçe',
            uk: 'Українська',
            kn: 'ಕನ್ನಡ',
            pl: 'Polski',
            yue: '粵語',
            my: 'ဗမာစာ',
            su: 'Basa Sunda',
            ro: 'Română',
            am: 'አማርኛ',
            ha: 'هَوُسَ',
            el: 'Ελληνικά',
            ceb: 'Cebuano',
            ne: 'नेपाली',
            so: 'Soomaaliga',
            sd: 'सिन्धी, سنڌي، سندھی‎',
            si: 'සිංහල',
            xh: 'isiXhosa',
            zu: 'isiZulu',
            ga: 'Gaeilge',
            tl: 'Tagalog',
            it: 'Italiano',
            hu: 'Magyar',
            fy: 'Frysk',
            sv: 'Svenska',
            da: 'Dansk',
            fi: 'Suomi',
            no: 'Norsk',
        };
        return nativeNames[langCode] || langCode;
    }
    /**
     * Get the country code of a language code
     * @param langCode - The language code.
     * @returns The country code of the language.
     * @example LangService.getCountryCode('en') // US
     */
    static getCountryCode(langCode) {
        const countryCodes = {
            en: 'US',
            es: 'ES',
            fr: 'FR',
            de: 'DE',
            he: 'IL',
            ar: 'SA',
            zh: 'CN',
            hi: 'IN',
            ru: 'RU',
            pt: 'PT',
            bn: 'BD',
            id: 'ID',
            ja: 'JP',
            fa: 'IR',
            pa: 'PK',
            jv: 'ID',
            mr: 'IN',
            te: 'IN',
            vi: 'VN',
            ko: 'KR',
            ta: 'IN',
            ur: 'PK',
            gu: 'IN',
            th: 'TH',
            or: 'IN',
            tr: 'TR',
            uk: 'UA',
            kn: 'IN',
            pl: 'PL',
            yue: 'CN',
            my: 'MM',
            su: 'ID',
            ro: 'RO',
            am: 'ET',
            ha: 'NG',
            el: 'GR',
            ceb: 'PH',
            ne: 'NP',
            so: 'SO',
            sd: 'PK',
            si: 'LK',
            xh: 'ZA',
            zu: 'ZA',
            ga: 'IE',
            tl: 'PH',
            it: 'IT',
            hu: 'HU',
            fy: 'NL',
            sv: 'SE',
            da: 'DK',
            fi: 'FI',
            no: 'NO',
        };
        return countryCodes[langCode] || langCode;
    }
    /**
     * Get the locale of a language code
     * @param langCode - The language code.
     * @returns The locale of the language.
     * @example LangService.getLocale('en') // en-US
     */
    static getLocale(langCode) {
        const countryCode = this.getCountryCode(langCode);
        return `${langCode}-${countryCode}`;
    }
}
exports.LangUtils = LangUtils;
//# sourceMappingURL=lang-utils.js.map