import angular from 'angular';
import { ActionEvent } from '../../../common';
import { TranslationService } from '../../../services';
import { LangUtils } from '../../../utils';
import { IBroadcastService } from '../../services';

export class UiLangSwitcherController {

    static $inject = ['$element', '$broadcast'];

    public onChange: ActionEvent<string>;

    public selectSource: { code: string, flagClass: string, nativeName: string }[];
    public selectedLang: { code: string, flagClass: string, nativeName: string };

    constructor(private $element: angular.IAugmentedJQuery, private $broadcast: IBroadcastService) {
        this.init();
    }

    private init(): void {
        const availableLangs = global.appGlobal.packageJson.appConfig.locales;

        this.selectSource = availableLangs.map(lang => {
            return {
                code: lang,
                flagClass: `fi fi-${LangUtils.getCountryCode(lang)?.toLowerCase()}`,
                nativeName: LangUtils.getNativeName(lang)
            };
        });

        const activeLanguage = TranslationService.getActiveLanguage();
        this.selectedLang = this.selectSource.find(lang => lang.code === activeLanguage);
    }

    public changeLanguage(langCode: string): void {
        this.selectedLang = this.selectSource.find(lang => lang.code === langCode);

        TranslationService.setActiveLanguage(langCode);
        this.$broadcast.broadcastAction('onChange', 'uiLangSwitcher', { args: [langCode] });

        if (this.onChange) {
            this.onChange({
                args: {
                    args: [langCode]
                }
            });

        }
    }

    public expandDropdown(): void {
        this.$element.find('.dropdown-toggle, .dropdown-menu').toggleClass('show');
    }
}

