"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptConfig = exports.Workspace = exports.Connection = exports.AppDb = void 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const class_transformer_1 = require("class-transformer");
require("reflect-metadata");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _1 = require(".");
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const common_1 = require("../common");
const utils_1 = require("../utils");
// #endregion
// #region DbEntityBase
/**
 * An abstract base class for database entities.
 */
class DbEntityBase {
    constructor() {
        this.id = "";
        this.name = "";
        this.description = "";
        this._errorMessages = new Array();
    }
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
    set errorMessages(value) {
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
    validate() {
        // Override in derived classes
        return false;
    }
}
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Object)
], DbEntityBase.prototype, "_errorMessages", void 0);
// #endregion
/* #region AppDb */
/**
 * Represents the application database.
 */
class AppDb {
    constructor() {
        /**
         * The array of workspaces.
         */
        this.workspaces = new Array();
        /**
         * The array of connections.
         */
        this.connections = new Array();
    }
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
    validate() {
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
    get workspace() {
        return this.workspaces.find(ws => ws.id == this.workspaceId) || new Workspace();
    }
    /**
     * Gets the array of org connections.
     */
    get orgConnections() {
        return this.connections.filter(conn => conn.type == common_1.ConnectionType.Org);
    }
}
__decorate([
    (0, class_transformer_1.Type)(() => Workspace),
    __metadata("design:type", Object)
], AppDb.prototype, "workspaces", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Connection),
    __metadata("design:type", Object)
], AppDb.prototype, "connections", void 0);
exports.AppDb = AppDb;
/* #endregion */
/* #region Connection */
/**
 * Represents a connection entity.
 */
class Connection extends DbEntityBase {
    constructor(init) {
        super();
        /**
         * The type of the connection.
         */
        this.type = common_1.ConnectionType.Unknown;
        /**
         * The map of SObject describes associated with the connection.
         */
        this.orgDescribe = new _1.OrgDescribe();
        if (init) {
            Object.assign(this, init);
        }
    }
    /**
     * The username associated with the connection.
     */
    get userName() {
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
        return this.type == common_1.ConnectionType.Org;
    }
}
__decorate([
    (0, common_1.ExcludeIfDefault)(common_1.ConnectionType.Unknown),
    __metadata("design:type", String)
], Connection.prototype, "type", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], Connection.prototype, "accessToken", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", _1.OrgDescribe)
], Connection.prototype, "orgDescribe", void 0);
exports.Connection = Connection;
/* #endregion */
/* #region Workspace */
/**
 * Represents a workspace entity.
 */
class Workspace extends DbEntityBase {
    constructor(init) {
        super();
        /**
         * The array of script configurations.
         */
        this.configs = new Array();
        /**
         * The CLI command associated with the workspace.
         */
        this.cli = {};
        if (init) {
            Object.assign(this, init);
        }
    }
    /**
     * Gets the source connection associated with the workspace.
     * @returns The source connection or an empty connection if not found.
     */
    get sourceConnection() {
        return this.db.connections.find(conn => conn.id == this.sourceConnectionId) || new Connection();
    }
    /**
     * Gets the target connection associated with the workspace.
     * @returns The target connection or an empty connection if not found.
     */
    get targetConnection() {
        return this.db.connections.find(conn => conn.id == this.targetConnectionId) || new Connection();
    }
    /**
     * Gets the first described connection associated with the workspace.
     * @returns The connection
     */
    get connection() {
        return this.sourceConnection.isOrgDescribed ? this.sourceConnection : this.targetConnection;
    }
    /**
     * Gets the connection associated with the given object.
     * @param name - The name of the SObject.
     * @param orgDescribe - The org describe.
     */
    getConnectionBySObject(name, orgDescribe) {
        const describe = orgDescribe.objectsMap.get(name);
        if (!describe)
            return { connection: null, dataSource: common_1.DataSource.unknown };
        return {
            connection: describe.dataSource == common_1.DataSource.target ? this.targetConnection : this.sourceConnection,
            dataSource: describe.dataSource
        };
    }
    /**
     * Gets the script configuration associated with the workspace.
     * @returns The script configuration or an empty script configuration if not found.
     */
    get config() {
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
    validate() {
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
__decorate([
    (0, class_transformer_1.Type)(() => ScriptConfig),
    __metadata("design:type", Object)
], Workspace.prototype, "configs", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], Workspace.prototype, "type", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", AppDb)
], Workspace.prototype, "db", void 0);
exports.Workspace = Workspace;
/* #endregion */
/* #region ScriptConfig */
/**
 * Represents a script configuration entity.
 */
class ScriptConfig extends DbEntityBase {
    constructor(init) {
        super();
        /**
         * The script associated with the configuration.
         */
        this.script = new _1.Script();
        if (init) {
            Object.assign(this, init);
        }
    }
    /**
     * Initializes the script configuration.
     */
    init() {
        this.id || (this.id = utils_1.CommonUtils.randomString());
        this.script.init();
    }
    resetId() {
        this.id = utils_1.CommonUtils.randomString();
        this.script.resetId();
    }
    /**
     * Validates the script configuration.
     * @returns True if the validation succeeded, false otherwise.
     */
    validate() {
        // eslint-disable-next-line prefer-const
        let isChanged = false;
        // Validation logic goes here
        return isChanged;
    }
    /**
     * Gets the object set associated with the configuration.
     * @returns The object set or an empty object set if not found.
     */
    get objectSet() {
        return this.script.objectSets.find(os => os.id == this.objectSetId) || new _1.ScriptObjectSet();
    }
    /**
     * Gets the script object associated with the configuration.
     * @returns The script object or an empty script object if not found.
     */
    get sObject() {
        return this.objectSet.isInitialized
            && this.objectSet.objects.find(o => o.id == this.sObjectId) || new _1.ScriptObject();
    }
}
__decorate([
    (0, class_transformer_1.Type)(() => _1.Script),
    __metadata("design:type", Object)
], ScriptConfig.prototype, "script", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Workspace)
], ScriptConfig.prototype, "ws", void 0);
exports.ScriptConfig = ScriptConfig;
/* #endregion */
//# sourceMappingURL=database-models.js.map