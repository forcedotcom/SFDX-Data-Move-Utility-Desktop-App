"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCode = void 0;
/**
 * An enumeration of HTTP status codes.
 */
var StatusCode;
(function (StatusCode) {
    /** Continue (100) */
    StatusCode[StatusCode["Continue"] = 100] = "Continue";
    /** Created (201) */
    StatusCode[StatusCode["Created"] = 201] = "Created";
    /** Accepted (202) */
    StatusCode[StatusCode["Accepted"] = 202] = "Accepted";
    /** Processing (102) */
    StatusCode[StatusCode["Processing"] = 102] = "Processing";
    /** OK (200) */
    StatusCode[StatusCode["OK"] = 200] = "OK";
    /** OK Partial (206) */
    StatusCode[StatusCode["OKPartial"] = 206] = "OKPartial";
    /** Not Found (404) */
    StatusCode[StatusCode["NotFound"] = 404] = "NotFound";
    /** Internal Server Error (500) */
    StatusCode[StatusCode["InternalServerError"] = 500] = "InternalServerError";
    /** General Error (500) */
    StatusCode[StatusCode["GeneralError"] = 500] = "GeneralError";
    /** Bad Request (400) */
    StatusCode[StatusCode["BadRequest"] = 400] = "BadRequest";
    /** Unauthorized (401) */
    StatusCode[StatusCode["Unauthorized"] = 401] = "Unauthorized";
    /** Forbidden (403) */
    StatusCode[StatusCode["Forbidden"] = 403] = "Forbidden";
    /** Too Many Requests (429) */
    StatusCode[StatusCode["TooManyRequests"] = 429] = "TooManyRequests";
    /** Service Unavailable (503) */
    StatusCode[StatusCode["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    /** Version Not Supported (505) */
    StatusCode[StatusCode["VersionNotSupported"] = 505] = "VersionNotSupported";
})(StatusCode = exports.StatusCode || (exports.StatusCode = {}));
//# sourceMappingURL=common.models.js.map