import { TranslateFnArgs } from '../../../models';
import { TranslationService } from '../../../services';

/**
 * Service for handling translation operations.
 */
export interface ITranslationService {
    /**
     * Translates text based on the provided arguments.
     * @param args - Arguments required for translation.
     * @returns The translated string.
     */
    translate(args: TranslateFnArgs): string;

    /**
     * Sets the active language.
     * @param lang - The language code to set as active.
     */
    setActiveLanguage(lang: string): void;

    /**
     * Retrieves the currently set active language.
     * @returns The active language code.
     */
    getActiveLanguage(): string;

    /**
     * Provides the current active language.
     */
    readonly activeLanguage: string;

    /**
     * Determines if the current active language is right-to-left (RTL).
     * @returns True if the active language is RTL, otherwise false.
     */
    readonly activeLanguageRtl: boolean;
}

/**
 * Service for handling translation operations.
 */
export class AngularTranslationService extends TranslationService implements ITranslationService { }