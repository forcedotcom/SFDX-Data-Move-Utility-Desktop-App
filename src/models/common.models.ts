/**
 * An base interface for an entity.
 */
export interface IEntityBase {
    /** The ID of the entity. */
    id?: string;
    /** The name of the entity. */
    name?: string;
    /** The description of the entity. */
    description?: string;
    /** The label of the entity. */
    label?: string;
    /** Error messages associated with the entity. */
    errorMessages?: string[];
    /** Indicates whether the entity is valid. */
    readonly isValid?: boolean;
    /** Indicates whether the entity is initialized. */
    readonly isInitialized?: boolean;
    /**
     * Initializes the entity.
     */
    init(): void;
}


/**
 * An enumeration of HTTP status codes.
 */
export enum StatusCode {
    /** Continue (100) */
    Continue = 100,
    /** Created (201) */
    Created = 201,
    /** Accepted (202) */
    Accepted = 202,
    /** Processing (102) */
    Processing = 102,
    /** OK (200) */
    OK = 200,
    /** OK Partial (206) */
    OKPartial = 206,
    /** Not Found (404) */
    NotFound = 404,
    /** Internal Server Error (500) */
    InternalServerError = 500,
    /** General Error (500) */
    GeneralError = 500,
    /** Bad Request (400) */
    BadRequest = 400,
    /** Unauthorized (401) */
    Unauthorized = 401,
    /** Forbidden (403) */
    Forbidden = 403,
    /** Too Many Requests (429) */
    TooManyRequests = 429,
    /** Service Unavailable (503) */
    ServiceUnavailable = 503,
    /** Version Not Supported (505) */
    VersionNotSupported = 505,
}


/**
 * An interface representing a grouped object.
 */
export interface IGroupedObject<T, GroupKey extends keyof T> {
    [prop: string]: T[GroupKey] | Array<{ [prop: string]: any }>;
}
