import { MarkdownService } from "../../../services";


/**
 * Service for handling Markdown-related operations.
 */
export interface IMarkdownService {
    /**
    * Renders a Markdown string to HTML.
    * @param {string} markdownString - The Markdown string to render.
    * @returns {string} The HTML representation of the Markdown string.
    */
    render(markdownString: string): string;
}


/**
 * Service for handling Markdown-related operations.
 */
export class AngularMarkdownService extends MarkdownService implements IMarkdownService { }
