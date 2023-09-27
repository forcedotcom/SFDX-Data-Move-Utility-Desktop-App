import { AngularMarkdownService } from ".";

export const MarkdownFilter = (markdownService: AngularMarkdownService) => {
    return (input: string) => {
        return markdownService.render(input);
    };
};

