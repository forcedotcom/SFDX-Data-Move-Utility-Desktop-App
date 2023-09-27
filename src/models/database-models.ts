// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Exclude, Expose, Type } from "class-transformer";
import 'reflect-metadata';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
    IEntityBase,
    OrgDescribe,
    Script,
    ScriptObject,
    ScriptObjectSet
} from ".";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ConnectionType, DataSource, ExcludeIfDefault } from "../common";
import { CommonUtils } from "../utils";


// #region AppDbData

/**
 * Represents an entity in the application data.
 */
export interface IAppDataEntity {
    id: string;
    name: string;
    userName?: string;
    description: string;
    type: string;
}

// #endregion


// #region DbEntityBase

/**
 * An abstract base class for database entities.
 */
abstract class DbEntityBase implements IEntityBase {

    id = "";
    name = "";
    description = "";

    @Exclude()
    protected _errorMessages = new Array<string>();

    /**
     * Gets the error messages associated with the entity.
     */
    get errorMessages() {
        return this._errorMessages;
    }

    /**
     * Sets the error messages associated with the entity.
     * @param value - The error messages.
     */
    set errorMessages(value: string[]) {
        this._errorMessages = value;
    }

    /**
     * Checks if the entity is initialized.
     * @returns True if the entity is initialized, false otherwise.
     */
    get isInitialized() {
        return !!this.id;
    }

    /**
     * Checks if the entity is valid.
     * @returns True if the entity is valid, false otherwise.
     */
    get isValid() {
        return this.isInitialized && !this.errorMessages.length;
    }

    /**
     * Initializes the entity.
     */
    init() {
        // Override in derived classes
    }

    /**
     * Validates the entity.
     * @returns True if the entity is valid, false otherwise.
     */
    validate(): boolean {
        // Override in derived classes
        return false;
    }
}

// #endregion


/* #region AppDb */

/**
 * Represents the application database.
 */
export class AppDb {
    /**
     * The array of workspaces.
     */
    @Type(() => Workspace)
    workspaces = new Array<Workspace>();

    /**
     * The ID of the active workspace.
     */
    workspaceId: string;

    /**
     * The array of connections.
     */
    @Type(() => Connection)
    connections = new Array<Connection>();

    /**
     * The language setting.
     */
    lang: string;

    /**
     * Initializes the application database.
     */
    init() {
        this.workspaces.forEach(ws => {
            ws.db = this;
            ws.init();
        });
        this.connections.forEach(conn => {
            conn.init();
        });
    }

    /**
     * Validates the application database.
     * @returns True if the validation succeeded, false otherwise.
     */
    validate(): boolean {
        return this.workspaces.reduce((isChanged, ws) => {
            return ws.validate() || isChanged;
        }, false)
            || this.connections.reduce((isChanged, conn) => {
                return conn.validate() || isChanged;
            }, false);
    }

    /**
     * Gets the active workspace.
     * @returns The active workspace or an empty workspace if not found.
     */
    get workspace(): Workspace {
        return this.workspaces.find(ws => ws.id == this.workspaceId) || new Workspace();
    }

    /**
     * Gets the array of org connections.
     */
    get orgConnections(): Connection[] {
        return this.connections.filter(conn => conn.type == ConnectionType.Org);
    }
}

/* #endregion */


/* #region Connection */

/**
 * Represents a connection entity.
 */
export class Connection extends DbEntityBase implements IAppDataEntity {
    constructor(init?: Partial<Connection>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }

    /**
     * The type of the connection.
     */
    @ExcludeIfDefault(ConnectionType.Unknown)
    type: ConnectionType = ConnectionType.Unknown;

    /**
     * The instance URL of the connection.
     */
    instanceUrl: string;

    /**
     * The API version of the connection.
     */
    apiVersion: string;

    /**
     * The organization ID of the connection.
     */
    orgId: string;

    /**
     * The user ID of the connection.
     */
    userId: string;

    /**
     * The alias of the connection.
     */
    alias: string;

    /**
     * The access token of the connection.
     */
    @Exclude()
    accessToken: string;

    /**
     * The map of SObject describes associated with the connection.
     */
    @Exclude()
    orgDescribe: OrgDescribe = new OrgDescribe();

    /**
     * The username associated with the connection.
     */
    get userName(): string {
        return this.alias || this.name;
    }

    /**
     * Indicates whether the org associated with the connection is described.
     */
    get isOrgDescribed() {
        return !!this.orgDescribe.isDescribed;
    }

    /**
     * Indicates whether the connection is an org connection.
     */
    get isOrg() {
        return this.type == ConnectionType.Org;
    }
}

/* #endregion */


/* #region Workspace */

/**
 * Represents a workspace entity.
 */
export class Workspace extends DbEntityBase implements IAppDataEntity {

    constructor(init?: Partial<Workspace>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }

    /**
     * The array of script configurations.
     */
    @Type(() => ScriptConfig)
    configs = new Array<ScriptConfig>();

    /**
     * The ID of the source connection.
     */
    sourceConnectionId: string;

    /**
     * The ID of the target connection.
     */
    targetConnectionId: string;

    /**
     * The ID of the script configuration.
     */
    configId: string;

    /**
     * The type of the workspace. Excluded from serialization.
     */
    @Exclude()
    type: string;

    /**
     * The reference to the application database.
     * Excluded from serialization.
     */
    @Exclude()
    db: AppDb;

    /**
     * The CLI command associated with the workspace.
     */
    cli: any = {};



    /**
     * Gets the source connection associated with the workspace.
     * @returns The source connection or an empty connection if not found.
     */
    get sourceConnection(): Connection {
        return this.db.connections.find(conn => conn.id == this.sourceConnectionId) || new Connection();
    }

    /**
     * Gets the target connection associated with the workspace.
     * @returns The target connection or an empty connection if not found.
     */
    get targetConnection(): Connection {
        return this.db.connections.find(conn => conn.id == this.targetConnectionId) || new Connection();
    }

    /**
     * Gets the first described connection associated with the workspace.
     * @returns The connection
     */
    get connection(): Connection {
        return this.sourceConnection.isOrgDescribed ? this.sourceConnection : this.targetConnection;
    }

    /**
     * Gets the connection associated with the given object.
     * @param name - The name of the SObject.
     * @param orgDescribe - The org describe.
     */
    getConnectionBySObject(name: string, orgDescribe: OrgDescribe): { connection: Connection, dataSource: DataSource } {
        const describe = orgDescribe.objectsMap.get(name);
        if (!describe) return { connection: null, dataSource: DataSource.unknown };
        return {
            connection: describe.dataSource == DataSource.target ? this.targetConnection : this.sourceConnection,
            dataSource: describe.dataSource
        };
    }

    /**
     * Gets the script configuration associated with the workspace.
     * @returns The script configuration or an empty script configuration if not found.
     */
    get config(): ScriptConfig {
        return this.configs.find(config => config.id == this.configId) || new ScriptConfig();
    }

    /**
     * Initializes the workspace.
     */
    init() {
        this.configs.forEach(config => {
            config.ws = this;
            config.init();
        });
    }

    /**
     * Validates the workspace.
     * @returns True if the validation succeeded, false otherwise.
     */
    validate(): boolean {
        let isChanged = false;
        if (!this.db.connections.some(conn => conn.id == this.sourceConnectionId)) {
            this.sourceConnectionId = '';
            isChanged = true;
        }
        if (!this.db.connections.some(conn => conn.id == this.targetConnectionId)) {
            this.targetConnectionId = '';
            isChanged = true;
        }
        return this.configs.reduce((isChanged, config) => {
            return config.validate() || isChanged;
        }, false) || isChanged;
    }
}

/* #endregion */


/* #region ScriptConfig */

/**
 * Represents a script configuration entity.
 */
export class ScriptConfig extends DbEntityBase {
    constructor(init?: Partial<ScriptConfig>) {
        super();
        if (init) {
            Object.assign(this, init);
        }
    }

    /**
     * The script associated with the configuration.
     */
    @Type(() => Script)
    script = new Script();

    /**
     * The reference to the parent workspace.
     * Excluded from serialization.
     */
    @Exclude()
    ws: Workspace;

    /**
     * Initializes the script configuration.
     */
    init() {
        this.id ||= CommonUtils.randomString();
        this.script.init();
    }

    resetId() {
        this.id = CommonUtils.randomString();
        this.script.resetId();
    }

    /**
     * Validates the script configuration.
     * @returns True if the validation succeeded, false otherwise.
     */
    validate(): boolean {
        // eslint-disable-next-line prefer-const
        let isChanged = false;

        // Validation logic goes here
        return isChanged;
    }

    /**
     * The ID of the object set associated with the configuration.
     */
    objectSetId: string;

    /**
     * The ID of the script object associated with the configuration.
     */
    sObjectId: string;

    /**
     * Gets the object set associated with the configuration.
     * @returns The object set or an empty object set if not found.
     */
    get objectSet(): ScriptObjectSet {
        return this.script.objectSets.find(os => os.id == this.objectSetId) || new ScriptObjectSet();
    }

    /**
     * Gets the script object associated with the configuration.
     * @returns The script object or an empty script object if not found.
     */
    get sObject(): ScriptObject {
        return this.objectSet.isInitialized
            && this.objectSet.objects.find(o => o.id == this.sObjectId) || new ScriptObject();
    }

}

/* #endregion */
