import 'reflect-metadata';
import { ClassConstructor, ClassTransformOptions, instanceToPlain, plainToInstance } from 'class-transformer';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { CommonUtils } from '../utils';


export class Database {
    private readonly filename: string;
    private readonly encoding: BufferEncoding;
    private data: Record<string, unknown>[] = [];

    constructor(filename: string, encoding: BufferEncoding = 'utf8') {
        this.filename = filename;
        this.encoding = encoding;
        this.loadSync();
    }

    /**
     * Loads the database from the file synchronously.
     */
    private loadSync() {
        try {
            const data = fs.readFileSync(this.filename, { encoding: this.encoding });
            if (!data) {
                fs.writeFileSync(this.filename, '[]', { encoding: this.encoding });
            } else {
                this.data = JSON.parse(data) as Record<string, unknown>[];
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                const directory = path.dirname(this.filename);
                if (!fs.existsSync(directory)) {
                    fs.mkdirSync(directory, { recursive: true });
                }
                fs.writeFileSync(this.filename, '[]', { encoding: this.encoding });
            } else {
                throw error;
            }
        }
    }

    /**
     * Loads the database from the file asynchronously.
     * @returns A promise that resolves to the Database instance.
     */
    public async loadAsync(): Promise<Database> {
        try {
            const readFileAsync = promisify(fs.readFile);
            const data = await readFileAsync(this.filename, { encoding: this.encoding });
            this.data = JSON.parse(data) as Record<string, unknown>[];
        } catch (error) {
            if (error.code === 'ENOENT') {
                const directory = path.dirname(this.filename);
                if (!fs.existsSync(directory)) {
                    await promisify(fs.mkdir)(directory, { recursive: true });
                }
                await promisify(fs.writeFile)(this.filename, '[]', { encoding: this.encoding });
            } else {
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
    public writeSync(options?: ClassTransformOptions): Database {
        const plain = instanceToPlain(this.data, options);
        fs.writeFileSync(this.filename, JSON.stringify(plain, null, 3), {
            encoding: this.encoding,
        });
        return this;
    }

    /**
     * Writes the database to the file asynchronously.
     * @param options The class-transformer options for transforming the data.
     * @returns A promise that resolves to the Database instance.
     */
    public async writeAsync(options?: ClassTransformOptions): Promise<Database> {
        const plain = instanceToPlain(this.data, options);
        await promisify(fs.writeFile)(this.filename, JSON.stringify(plain), {
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
    public create<T = Record<string, unknown>>(
        record: T,
        id?: string,
        options?: ClassTransformOptions,
        writeImmediatelly = true
    ): Database {
        id ||= CommonUtils.randomString();
        const newRecord = { ...record, id };
        this.data.push(newRecord as Record<string, unknown>);
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
    public getById<T>(
        id: string,
        cls: ClassConstructor<T>,
        options?: ClassTransformOptions
    ): T | undefined {
        const record = this.data.find((record) => record.id === id) as T;
        if (!record) return;
        return plainToInstance(cls, record, options);
    }

    /**
     * Updates a record in the database by ID.
     * @param id The ID of the record to update.
     * @param updates The partial updates to apply to the record.
     * @param options The class-transformer options for transforming the data.
     * @param writeImmediatelly If true, immediately writes the database to the file after updating the record.
     * @returns The Database instance.
     */
    public updateById<T = Record<string, unknown>>(
        id: string,
        updates: Partial<T>,
        options?: ClassTransformOptions,
        writeImmediatelly = true
    ): Database {
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
    public deleteById(
        id: string,
        options?: ClassTransformOptions,
        writeImmediatelly = true
    ): Database {
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
    public all(): Record<string, unknown>[] {
        return [...this.data];
    }

    /**
     * Clears the database, removing all records.
     * @param options The class-transformer options for transforming the data.
     * @param writeImmediatelly If true, immediately writes the database to the file after clearing it.
     * @returns The Database instance.
     */
    public clear(options?: ClassTransformOptions, writeImmediatelly = true): Database {
        this.data = [];
        writeImmediatelly && this.writeSync(options);
        return this;
    }
}
