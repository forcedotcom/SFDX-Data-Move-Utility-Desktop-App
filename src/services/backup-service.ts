import * as fs from 'fs';
import * as path from 'path';
import { CommonUtils } from '../utils';

export class BackupService {

  private schedules: Map<string, NodeJS.Timeout> = new Map();

  constructor(private backupFolderPath: string, private filePath: string) { }

  /**
   * Creates a backup of the file.
   * If the backup folder doesn't exist, it will be created.
   * The backup file will have the original filename with a timestamp appended.
   */
  public backupFile(): void {
    if (!fs.existsSync(this.backupFolderPath)) {
      fs.mkdirSync(this.backupFolderPath, { recursive: true });
    }

    const originalFilename = path.basename(this.filePath);
    const originalFileExtension = path.extname(this.filePath);
    const originalFilenameWithoutExtension = originalFilename.slice(
      0,
      originalFilename.length - originalFileExtension.length
    );

    const timestamp = new Date();
    const formattedTimestamp = `${timestamp.getFullYear()}-${String(
      timestamp.getMonth() + 1
    ).padStart(2, '0')}-${String(timestamp.getDate()).padStart(2, '0')}-${String(
      timestamp.getHours()
    ).padStart(2, '0')}-${String(timestamp.getMinutes()).padStart(2, '0')}-${String(
      timestamp.getSeconds()
    ).padStart(2, '0')}`;

    const backupFilename = `${originalFilenameWithoutExtension}-backup-${formattedTimestamp}${originalFileExtension}`;

    const backupFilePath = path.join(this.backupFolderPath, backupFilename);

    fs.copyFileSync(this.filePath, backupFilePath);
  }

  /**
   * Schedules a backup of the file in a given interval in minutes.
   * @param intervalNMinutes - The interval in minutes.
   * @returns The schedule ID.
   */  
  public scheduleBackupFile(intervalNMinutes: number): string {
    if (intervalNMinutes <= 0) {
      return null;
    }
    const interval = intervalNMinutes * 60 * 1000; // Convert minutes to milliseconds

    const scheduleId = CommonUtils.randomString();
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
  public deleteBackupFileSchedule(scheduleId: string): boolean {
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
