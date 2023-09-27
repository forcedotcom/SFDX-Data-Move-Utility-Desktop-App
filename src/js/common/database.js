"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
require("reflect-metadata");
const class_transformer_1 = require("class-transformer");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const utils_1 = require("../utils");
class Database {
    constructor(filename, encoding = 'utf8') {
        this.data = [];
        this.filename = filename;
        this.encoding = encoding;
        this.loadSync();
    }
    /**
     * Loads the database from the file synchronously.
     */
    loadSync() {
        try {
            const data = fs_1.default.readFileSync(this.filename, { encoding: this.encoding });
            if (!data) {
                fs_1.default.writeFileSync(this.filename, '[]', { encoding: this.encoding });
            }
            else {
                this.data = JSON.parse(data);
            }
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                const directory = path_1.default.dirname(this.filename);
                if (!fs_1.default.existsSync(directory)) {
                    fs_1.default.mkdirSync(directory, { recursive: true });
                }
                fs_1.default.writeFileSync(this.filename, '[]', { encoding: this.encoding });
            }
            else {
                throw error;
            }
        }
    }
    /**
     * Loads the database from the file asynchronously.
     * @returns A promise that resolves to the Database instance.
     */
    async loadAsync() {
        try {
            const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
            const data = await readFileAsync(this.filename, { encoding: this.encoding });
            this.data = JSON.parse(data);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                const directory = path_1.default.dirname(this.filename);
                if (!fs_1.default.existsSync(directory)) {
                    await (0, util_1.promisify)(fs_1.default.mkdir)(directory, { recursive: true });
                }
                await (0, util_1.promisify)(fs_1.default.writeFile)(this.filename, '[]', { encoding: this.encoding });
            }
            else {
                throw error;
            }
        }
        return this;
    }
    /**
     * Writes the database to the file synchronously.
     * @param options The class-transformer options for transforming the data.
     * @returns The Database instance.
     */
    writeSync(options) {
        const plain = (0, class_transformer_1.instanceToPlain)(this.data, options);
        fs_1.default.writeFileSync(this.filename, JSON.stringify(plain, null, 3), {
            encoding: this.encoding,
        });
        return this;
    }
    /**
     * Writes the database to the file asynchronously.
     * @param options The class-transformer options for transforming the data.
     * @returns A promise that resolves to the Database instance.
     */
    async writeAsync(options) {
        const plain = (0, class_transformer_1.instanceToPlain)(this.data, options);
        await (0, util_1.promisify)(fs_1.default.writeFile)(this.filename, JSON.stringify(plain), {
            encoding: this.encoding,
        });
        return this;
    }
    /**
     * Creates a new record in the database.
     * @param record The record to create.
     * @param id The ID of the record (optional).
     * @param options The class-transformer options for transforming the data.
     * @param writeImmediatelly If true, immediately writes the database to the file after creating the record.
     * @returns The Database instance.
     */
    create(record, id, options, writeImmediatelly = true) {
        id || (id = utils_1.CommonUtils.randomString());
        const newRecord = { ...record, id };
        this.data.push(newRecord);
        writeImmediatelly && this.writeSync(options);
        return this;
    }
    /**
     * Retrieves a record from the database by ID.
     * @param id The ID of the record to retrieve.
     * @param cls The class constructor for transforming the record to an instance.
     * @param options The class-transformer options for transforming the data.
     * @returns The instance of the record or undefined if not found.
     */
    getById(id, cls, options) {
        const record = this.data.find((record) => record.id === id);
        if (!record)
            return;
        return (0, class_transformer_1.plainToInstance)(cls, record, options);
    }
    /**
     * Updates a record in the database by ID.
     * @param id The ID of the record to update.
     * @param updates The partial updates to apply to the record.
     * @param options The class-transformer options for transforming the data.
     * @param writeImmediatelly If true, immediately writes the database to the file after updating the record.
     * @returns The Database instance.
     */
    updateById(id, updates, options, writeImmediatelly = true) {
        const index = this.data.findIndex((record) => record.id === id);
        if (index !== -1) {
            this.data[index] = { ...this.data[index], ...updates, id };
            writeImmediatelly && this.writeSync(options);
        }
        return this;
    }
    /**
     * Deletes a record from the database by ID.
     * @param id The ID of the record to delete.
     * @param options The class-transformer options for transforming the data.
     * @param writeImmediatelly If true, immediately writes the database to the file after deleting the record.
     * @returns The Database instance.
     */
    deleteById(id, options, writeImmediatelly = true) {
        const index = this.data.findIndex((record) => record.id === id);
        if (index !== -1) {
            this.data.splice(index, 1);
            writeImmediatelly && this.writeSync(options);
        }
        return this;
    }
    /**
     * Retrieves all records from the database.
     * @returns An array of all records.
     */
    all() {
        return [...this.data];
    }
    /**
     * Clears the database, removing all records.
     * @param options The class-transformer options for transforming the data.
     * @param writeImmediatelly If true, immediately writes the database to the file after clearing it.
     * @returns The Database instance.
     */
    clear(options, writeImmediatelly = true) {
        this.data = [];
        writeImmediatelly && this.writeSync(options);
        return this;
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map