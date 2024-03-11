"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OsUtils = void 0;
const os_1 = __importDefault(require("os"));
/**
 *  Utils class for operating system related operations.
 */
class OsUtils {
    /**
     *  Gets the details of the operating system.
     * @returns
     */
    static getOSDetails() {
        return {
            platform: os_1.default.platform(),
            release: os_1.default.release(),
            type: os_1.default.type(),
            arch: os_1.default.arch(),
            cpuCoreCount: os_1.default.cpus().length,
            totalMemory: os_1.default.totalmem(),
            freeMemory: os_1.default.freemem(),
            uptime: os_1.default.uptime() // System uptime in seconds
        };
    }
}
exports.OsUtils = OsUtils;
//# sourceMappingURL=os-utils.js.map