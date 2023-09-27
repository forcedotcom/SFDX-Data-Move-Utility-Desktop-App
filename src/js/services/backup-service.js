"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("../utils");
class BackupService {
    constructor(backupFolderPath, filePath) {
        this.backupFolderPath = backupFolderPath;
        this.filePath = filePath;
        this.schedules = new Map();
    }
    /**
     * Creates a backup of the file.
     * If the backup folder doesn't exist, it will be created.
     * The backup file will have the original filename with a timestamp appended.
     */
    backupFile() {
        if (!fs.existsSync(this.backupFolderPath)) {
            fs.mkdirSync(this.backupFolderPath, { recursive: true });
        }
        const originalFilename = path.basename(this.filePath);
        const originalFileExtension = path.extname(this.filePath);
        const originalFilenameWithoutExtension = originalFilename.slice(0, originalFilename.length - originalFileExtension.length);
        const timestamp = new Date();
        const formattedTimestamp = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}-${String(timestamp.getHours()).padStart(2, '0')}-${String(timestamp.getMinutes()).padStart(2, '0')}-${String(timestamp.getSeconds()).padStart(2, '0')}`;
        const backupFilename = `${originalFilenameWithoutExtension}-backup-${formattedTimestamp}${originalFileExtension}`;
        const backupFilePath = path.join(this.backupFolderPath, backupFilename);
        fs.copyFileSync(this.filePath, backupFilePath);
    }
    /**
     * Schedules a backup of the file in a given interval in minutes.
     * @param intervalNMinutes - The interval in minutes.
     * @returns The schedule ID.
     */
    scheduleBackupFile(intervalNMinutes) {
        if (intervalNMinutes <= 0) {
            return null;
        }
        const interval = intervalNMinutes * 60 * 1000; // Convert minutes to milliseconds
        const scheduleId = utils_1.CommonUtils.randomString();
        const backupTask = setInterval(() => {
            this.backupFile();
        }, interval);
        this.schedules.set(scheduleId, backupTask);
        return scheduleId;
    }
    /**
     * Deletes a scheduled backup of the file.
     * @param scheduleId - The schedule ID.
     * @returns True if the schedule was deleted, false otherwise.
     */
    deleteBackupFileSchedule(scheduleId) {
        if (!scheduleId) {
            return false;
        }
        const backupTask = this.schedules.get(scheduleId);
        if (backupTask) {
            clearInterval(backupTask);
            this.schedules.delete(scheduleId);
            return true;
        }
        return false;
    }
}
exports.BackupService = BackupService;
//# sourceMappingURL=backup-service.js.map