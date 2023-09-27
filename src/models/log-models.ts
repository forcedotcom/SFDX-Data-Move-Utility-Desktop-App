/**
 * An object type representing information about a function call stack.
 */
export type CallerInfo = {
    /** The function name. */
    functionName: string;
    /** The line number. */
    lineNumber: number;
    /** The full stack trace. */
    fullStackTrace: string;
};