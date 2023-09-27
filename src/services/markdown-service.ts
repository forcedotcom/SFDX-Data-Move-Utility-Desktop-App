

/**
 * Service for handling Markdown-related operations.
 */
export class MarkdownService {


    /**
    * Renders a Markdown string to HTML.
    * @param {string} markdownString - The Markdown string to render.
    * @returns {string} The HTML representation of the Markdown string.
    */
    render(markdownString: string): string {
        let html = markdownString || '';
        html = this.renderLists(html);
        html = this.renderBold(html);
        html = this.renderItalic(html);
        html = this.renderHeadings(html);
        html = this.renderLinks(html);
        html = this.renderNewLines(html);
        return html;
    }

    /* #region Private */
    /**
     * Renders bold text in HTML.
     * @param {string} text - The text to render as bold.
     * @returns {string} The HTML representation of the bold text.
     */
    private renderBold(text: string): string {
        return text.replace(/(\*\*|__)(.+?)\1/g, '<strong>$2</strong>');
    }

    /**
     * Renders italic text in HTML.
     * @param {string} text - The text to render as italic.
     * @returns {string} The HTML representation of the italic text.
     */
    private renderItalic(text: string): string {
        return text.replace(/(\*|_)(.+?)\1/g, '<em>$2</em>');
    }

    /**
     * Renders headings in HTML.
     * @param {string} text - The text to render as headings.
     * @returns {string} The HTML representation of the headings.
     */
    private renderHeadings(text: string): string {
        // eslint-disable-next-line no-useless-escape
        return text.replace(/^(\#{1,6})\s+(.+)$/gm, (match, hashes, content) => {
            const level = hashes.length;
            return `<h${level}>${content}</h${level}>`;
        });
    }

    /**
     * Renders lists in HTML.
     * @param {string} text - The text to render as lists.
     * @returns {string} The HTML representation of the lists.
     */
    private renderLists(text: string): string {
        const lines = text.split('\n');
        const formattedLines: string[] = [];
        let isList = false;

        for (const line of lines) {
            if (/^\s*[-*]\s+(.*)$/.test(line)) {
                if (!isList) {
                    isList = true;
                    formattedLines.push('<ul>');
                }
                formattedLines[formattedLines.length - 1] += `<li>${line.slice(2).trim()}</li>`;
            } else {
                if (isList) {
                    isList = false;
                    formattedLines[formattedLines.length - 1] += `</ul>`;
                }
                formattedLines.push(line);
            }
        }

        if (isList) {
            formattedLines[formattedLines.length - 1] += `</ul>`;
        }

        return formattedLines.join('\n').replace("</ul>\n", "</ul>");
    }

    /**
     * Renders new lines as HTML line breaks.
     * @param {string} text - The text to render with line breaks.
     * @returns {string} The HTML representation with line breaks.
     */
    private renderNewLines(text: string): string {
        return text.replace(/\n/g, '<br/>');
    }

    /**
     * Renders links in HTML.
     * @param {string} text - The text to render as links.
     * @returns {string} The HTML representation of the links.
     */
    private renderLinks(text: string): string {
        const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
        return text
            .replace(linkPattern, '<a href="$2">$1</a>')
            .replace('^!', '(')
            .replace('!^', ')');
    }
    /* #endregion */


}
