import { ITranslationService } from ".";


export class TranslationFilter {
    constructor(private $translate: ITranslationService) { }

    filter(input: string, args: { [key: string]: string }, lang?: string): string {
        return this.$translate.translate({ key: input, params: args, lang });
    }
}