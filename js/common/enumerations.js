"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateFormat = exports.ErrorSource = exports.BsSize = exports.BsButtonStyle = exports.FaIcon = exports.DataSource = exports.DataCacheTypes = exports.Operation = exports.ConnectionType = exports.SourceType = exports.ProgressEventType = exports.DialogResult = exports.DialogButton = exports.DialogType = exports.MessageType = exports.WizardStepByView = exports.ViewByWizardStep = exports.View = exports.AppPathType = void 0;
// Application enumerations ----------------------------------------------------------
/**  Enumeration of application path types. */
var AppPathType;
(function (AppPathType) {
    AppPathType["dataRootPath"] = "dataRootPath";
    AppPathType["appPath"] = "appPath";
    AppPathType["scriptPath"] = "scriptPath";
    AppPathType["logsPath"] = "logsPath";
    AppPathType["imagesPath"] = "imagesPath";
    AppPathType["themesPath"] = "themesPath";
    AppPathType["i18nPath"] = "i18nPath";
    AppPathType["dbBackupPath"] = "dbBackupPath";
})(AppPathType = exports.AppPathType || (exports.AppPathType = {}));
/** Enumeration of application views. */
var View;
(function (View) {
    /** Home view. */
    View["home"] = "home";
    /** Connect view. */
    View["connection"] = "connection";
    /** Configuration view. */
    View["configuration"] = "configuration";
    /** Preview view. */
    View["preview"] = "preview";
    /** Run view. */
    View["run"] = "run";
})(View = exports.View || (exports.View = {}));
/** Enumeration of application views by wizard step number. */
exports.ViewByWizardStep = {
    [1]: View.home,
    [2]: View.connection,
    [3]: View.configuration,
    [4]: View.preview,
    [5]: View.run,
};
/** Enumeration of wizard steps by view number. */
exports.WizardStepByView = {
    [View.home]: 1,
    [View.connection]: 2,
    [View.configuration]: 3,
    [View.preview]: 4,
    [View.run]: 5,
};
// Messagging enumerations -------------------------------------------------------
/**
 * Enumeration of message types.
 */
var MessageType;
(function (MessageType) {
    MessageType["info"] = "info";
    MessageType["warning"] = "warning";
    MessageType["error"] = "error";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
/**
 * Enumeration of dialog types.
 */
var DialogType;
(function (DialogType) {
    DialogType["yesno"] = "yesno";
    DialogType["okcancel"] = "okcancel";
    DialogType["success"] = "success";
    DialogType["error"] = "error";
    DialogType["warning"] = "warning";
    DialogType["info"] = "info";
    DialogType["input"] = "input";
    DialogType["select"] = "select";
    DialogType["autocomplete"] = "autocomplete";
    DialogType["multiselect"] = "multiselect";
    DialogType["danger"] = "error";
    DialogType["question"] = "question";
})(DialogType = exports.DialogType || (exports.DialogType = {}));
/**
 * Enumeration of dialog button options.
 */
var DialogButton;
(function (DialogButton) {
    DialogButton["ok"] = "ok";
    DialogButton["cancel"] = "cancel";
    DialogButton["yes"] = "yes";
    DialogButton["no"] = "no";
    DialogButton["exit"] = "exit";
    DialogButton["reload"] = "reload";
})(DialogButton = exports.DialogButton || (exports.DialogButton = {}));
/**
 * Enumeration of dialog results.
 */
var DialogResult;
(function (DialogResult) {
    DialogResult["ok"] = "ok";
    DialogResult["cancel"] = "cancel";
    DialogResult["yes"] = "ok";
    DialogResult["no"] = "no";
    DialogResult["exit"] = "ok";
    DialogResult["reload"] = "ok";
})(DialogResult = exports.DialogResult || (exports.DialogResult = {}));
// Event enumerations -------------------------------------------------------
/**
 * Enumeration of event types for long operations.
 * Specifies different types of events during a long operation, such as start, progress, notification, end, etc.
 */
var ProgressEventType;
(function (ProgressEventType) {
    ProgressEventType["start"] = "start";
    ProgressEventType["progress"] = "progress";
    ProgressEventType["ui_notification"] = "ui_notification";
    ProgressEventType["end"] = "end";
    ProgressEventType["stdOutData"] = "stdOutData";
    ProgressEventType["stdErrData"] = "stdErrData";
    ProgressEventType["error"] = "error";
})(ProgressEventType = exports.ProgressEventType || (exports.ProgressEventType = {}));
// SFDMU enumerations -------------------------------------------------------
/**
 * Enumeration of source types.
 * Specifies the type of data source as source, target, or unknown.
 */
var SourceType;
(function (SourceType) {
    SourceType["Source"] = "Source";
    SourceType["Target"] = "Target";
    SourceType["Unknown"] = "Unknown";
})(SourceType = exports.SourceType || (exports.SourceType = {}));
/**
 * Enumeration of connection types.
 * Specifies the type of connection as org, file, one-direction, or unknown.
 */
var ConnectionType;
(function (ConnectionType) {
    ConnectionType["Org"] = "Org";
    ConnectionType["File"] = "File";
    ConnectionType["OneDirection"] = "OneDirection";
    ConnectionType["Unknown"] = "Unknown";
})(ConnectionType = exports.ConnectionType || (exports.ConnectionType = {}));
/**
 * Enumeration of operation types.
 * Specifies the type of operation, such as insert, update, upsert, readonly, delete, delete source, delete hierarchy, hard delete, or unknown.
 */
var Operation;
(function (Operation) {
    Operation["Insert"] = "Insert";
    Operation["Update"] = "Update";
    Operation["Upsert"] = "Upsert";
    Operation["Readonly"] = "Readonly";
    Operation["Delete"] = "Delete";
    Operation["DeleteSource"] = "DeleteSource";
    Operation["DeleteHierarchy"] = "DeleteHierarchy";
    Operation["HardDelete"] = "HardDelete";
    Operation["Unknown"] = "Unknown";
})(Operation = exports.Operation || (exports.Operation = {}));
/**
 * Enumeration of data cache types.
 * Specifies the type of data cache, such as in-memory, clean file cache, or file cache.
 */
var DataCacheTypes;
(function (DataCacheTypes) {
    DataCacheTypes["InMemory"] = "InMemory";
    DataCacheTypes["CleanFileCache"] = "CleanFileCache";
    DataCacheTypes["FileCache"] = "FileCache";
})(DataCacheTypes = exports.DataCacheTypes || (exports.DataCacheTypes = {}));
var DataSource;
(function (DataSource) {
    DataSource["unknown"] = "unknown";
    DataSource["none"] = "none";
    DataSource["source"] = "source";
    DataSource["target"] = "target";
    DataSource["both"] = "both";
})(DataSource = exports.DataSource || (exports.DataSource = {}));
// UI enumerations ---------------------------------------------------
/** Font awesome icons. */
var FaIcon;
(function (FaIcon) {
    /** Info circle icon. */
    FaIcon["infoCircle"] = "fas fa-info-circle";
    /** Question circle icon. */
    FaIcon["questionCircle"] = "fas fa-question-circle";
    /** Exclamation circle icon. */
    FaIcon["exclamationCircle"] = "fas fa-exclamation-circle";
    /** Exclamation triangle icon. */
    FaIcon["exclamationTriangle"] = "fas fa-exclamation-triangle";
    /** Check circle icon. */
    FaIcon["checkCircle"] = "fas fa-check-circle";
    /** Check icon. */
    FaIcon["check"] = "fas fa-check";
    /** Times circle icon. */
    FaIcon["timesCircle"] = "fas fa-times-circle";
    /** Edit icon. */
    FaIcon["edit"] = "fas fa-edit";
    /** Save icon. */
    FaIcon["save"] = "fas fa-save";
    /** Smile icon. */
    FaIcon["smile"] = "fas fa-smile";
    /** Trash icon. */
    FaIcon["trash"] = "fas fa-trash";
    /** Plus icon. */
    FaIcon["plus"] = "fas fa-plus";
    /** Minus icon. */
    FaIcon["minus"] = "fas fa-minus";
    /** Close icon. */
    FaIcon["close"] = "fas fa-times";
    /** Folder icon. */
    FaIcon["folder"] = "fas fa-folder";
    /** Open folder icon. */
    FaIcon["folderOpen"] = "fas fa-folder-open";
    /** File import icon. */
    FaIcon["fileImport"] = "fas fa-file-import";
    /** File export icon. */
    FaIcon["fileExport"] = "fas fa-file-export";
    /** Download icon. */
    FaIcon["download"] = "fas fa-download";
    /** Upload icon. */
    FaIcon["upload"] = "fas fa-upload";
    /** Search icon. */
    FaIcon["search"] = "fas fa-search";
    /** Cog icon. */
    FaIcon["cog"] = "fas fa-cog";
    /** Settings icon. */
    FaIcon["settings"] = "fas fa-cogs";
    /** Lock icon. */
    FaIcon["lock"] = "fas fa-lock";
    /** Unlock icon. */
    FaIcon["unlock"] = "fas fa-unlock";
    /** User icon. */
    FaIcon["user"] = "fas fa-user";
    /** Users icon. */
    FaIcon["users"] = "fas fa-users";
    /** Home icon. */
    FaIcon["home"] = "fas fa-home";
    /** List icon. */
    FaIcon["list"] = "fas fa-list";
    /** Calendar icon. */
    FaIcon["calendar"] = "fas fa-calendar";
    /** Clock icon. */
    FaIcon["clock"] = "fas fa-clock";
    /** Map icon. */
    FaIcon["map"] = "fas fa-map";
    /** Location arrow icon. */
    FaIcon["locationArrow"] = "fas fa-location-arrow";
    /** Phone icon. */
    FaIcon["phone"] = "fas fa-phone";
    /** Envelope icon. */
    FaIcon["envelope"] = "fas fa-envelope";
    /** Flag icon. */
    FaIcon["flag"] = "fas fa-flag";
    /** Comment icon. */
    FaIcon["comment"] = "fas fa-comment";
    /** Share icon. */
    FaIcon["share"] = "fas fa-share";
    /** Heart icon. */
    FaIcon["heart"] = "fas fa-heart";
    /** Pen icon. */
    FaIcon["pen"] = "fas fa-pen";
    /** Lightbulb icon. */
    FaIcon["lightbulb"] = "fas fa-lightbulb";
    /** Headset icon. */
    FaIcon["headset"] = "fas fa-headset";
    /** Sitemap icon. */
    FaIcon["sitemap"] = "fas fa-sitemap";
    /** Cloud icon. */
    FaIcon["cloud"] = "fas fa-cloud";
    /** Arrow up icon. */
    FaIcon["arrowUp"] = "fas fa-arrow-up";
    /** Arrow down icon. */
    FaIcon["arrowDown"] = "fas fa-arrow-down";
    /** Database icon. */
    FaIcon["database"] = "fas fa-database";
    /** Drag handle icon. */
    FaIcon["dragHandle"] = "fas fa-grip-vertical";
    /** Columns icon. */
    FaIcon["columns"] = "fas fa-columns";
    /** Fields mapping icon. */
    FaIcon["fieldsMapping"] = "fas fa-arrows-alt-h";
    /** Values mapping icon. */
    FaIcon["valuesMapping"] = "fas fa-exchange-alt";
    /** Data anonymization icon. */
    FaIcon["dataAnonymization"] = "fas fa-user-secret";
    /** Polymorphic field icon. */
    FaIcon["polymorphicField"] = "fas fa-code-branch";
    /** Query icon. */
    FaIcon["query"] = "fas fa-code";
    /** Cleanup icon. */
    FaIcon["cleanup"] = "fas fa-broom";
    /** Export icon */
    FaIcon["export"] = "fas fa-file-export";
    /** Import icon */
    FaIcon["import"] = "fas fa-file-import";
    /** Eraser icon */
    FaIcon["eraser"] = "fas fa-eraser";
    /** Log file icon */
    FaIcon["logFile"] = "fas fa-file-alt";
    /** Test icon. */
    FaIcon["test"] = "fas fa-flask";
    /** Link icon. */
    FaIcon["link"] = "fas fa-link";
    /** File icon. */
    FaIcon["file"] = "fas fa-file";
    /** Sign out icon. */
    FaIcon["faSignOutAlt"] = "fas fa-sign-out-alt";
    /** Refresh icon. */
    FaIcon["refresh"] = "fas fa-sync-alt";
    /** Github icon. */
    FaIcon["github"] = "fab fa-github";
    /** Folder plus icon. */
    FaIcon["folderPlus"] = "fas fa-folder-plus";
    /** Folder tree icon. */
    FaIcon["folderTree"] = "fas fa-folder-tree";
    /** Sync icon. */
    FaIcon["sync"] = "fas fa-sync";
    /** Cube icon. */
    FaIcon["cube"] = "fas fa-cube";
    /** Ban icon. */
    FaIcon["ban"] = "fas fa-ban";
    /** Play icon */
    FaIcon["play"] = "fas fa-play";
    /** Question icon. */
    FaIcon["question"] = "fas fa-question";
    /** Icons representing adding item to list. */
    FaIcon["addItemToList"] = "fas fa-list-ul with-plus";
    /** Icons representing removing item from list. */
    FaIcon["removeItemFromList"] = "fas fa-list-ul with-minus";
    /** Representing a field. */
    FaIcon["field"] = "fas fa-columns";
    /** Representing a copy icon. */
    FaIcon["copy"] = "fas fa-copy";
    /** Representing a crown icon. */
    FaIcon["crown"] = "fas fa-crown";
    /** Representing a star icon. */
    FaIcon["star"] = "fas fa-star";
    /** Representing a mapping icon. */
    FaIcon["mapping"] = "fas fa-arrows-alt-h";
    /** Representing a terminal icon. */
    FaIcon["terminal"] = "fa fa-terminal";
    /** Representing a eye icon. */
    FaIcon["eye"] = "fa fa-eye";
    /** Representing a level down icon. */
    FaIcon["child"] = "fa fa-level-down-alt";
    /** Representing add-on icon. */
    FaIcon["addOn"] = "fas fa-plus-square";
    /** Representing an undo icon. */
    FaIcon["undo"] = "fas fa-undo";
})(FaIcon = exports.FaIcon || (exports.FaIcon = {}));
/** Enumeration of button styles. */
var BsButtonStyle;
(function (BsButtonStyle) {
    /** Primary button style. */
    BsButtonStyle["primary"] = "btn btn-primary";
    /** Secondary button style. */
    BsButtonStyle["secondary"] = "btn btn-secondary";
    /** Success button style. */
    BsButtonStyle["success"] = "btn btn-success";
    /** Danger button style. */
    BsButtonStyle["danger"] = "btn btn-danger";
    /** Warning button style. */
    BsButtonStyle["warning"] = "btn btn-warning";
    /** Info button style. */
    BsButtonStyle["info"] = "btn btn-info";
    /** Light button style. */
    BsButtonStyle["light"] = "btn btn-light";
    /** Dark button style. */
    BsButtonStyle["dark"] = "btn btn-dark";
    /** Link button style. */
    BsButtonStyle["link"] = "btn btn-link";
    /** Primary outline button style. */
    BsButtonStyle["outlinePrimary"] = "btn btn-outline-primary";
    /** Secondary outline button style. */
    BsButtonStyle["outlineSecondary"] = "btn btn-outline-secondary";
    /** Success outline button style. */
    BsButtonStyle["outlineSuccess"] = "btn btn-outline-success";
    /** Danger outline button style. */
    BsButtonStyle["outlineDanger"] = "btn btn-outline-danger";
    /** Warning outline button style. */
    BsButtonStyle["outlineWarning"] = "btn btn-outline-warning";
    /** Info outline button style. */
    BsButtonStyle["outlineInfo"] = "btn btn-outline-info";
    /** Light outline button style. */
    BsButtonStyle["outlineLight"] = "btn btn-outline-light";
    /** Dark outline button style. */
    BsButtonStyle["outlineDark"] = "btn btn-outline-dark";
})(BsButtonStyle = exports.BsButtonStyle || (exports.BsButtonStyle = {}));
/** Enumeration of button sizes. */
var BsSize;
(function (BsSize) {
    /** Large size. */
    BsSize["lg"] = "lg";
    /** Small size. */
    BsSize["sm"] = "sm";
    /** Extra small size. */
    BsSize["xs"] = "xs";
    /** Normal size. */
    BsSize["md"] = "md";
})(BsSize = exports.BsSize || (exports.BsSize = {}));
/** The source of the error. */
var ErrorSource;
(function (ErrorSource) {
    ErrorSource["objectList"] = "objectList";
    ErrorSource["objectSets"] = "objectSets";
    ErrorSource["objectFields"] = "objectFields";
    ErrorSource["objectSettings"] = "objectSettings";
    ErrorSource["configurationSettings"] = "configurationSettings";
    ErrorSource["cliSettings"] = "cliSettings";
})(ErrorSource = exports.ErrorSource || (exports.ErrorSource = {}));
/**
 * Represents the date format for angularjs date filter.
 */
var DateFormat;
(function (DateFormat) {
    DateFormat["medium"] = "medium";
    DateFormat["short"] = "short";
    DateFormat["fullDate"] = "fullDate";
    DateFormat["longDate"] = "longDate";
    DateFormat["mediumDate"] = "mediumDate";
    DateFormat["shortDate"] = "shortDate";
    DateFormat["mediumTime"] = "mediumTime";
    DateFormat["shortTime"] = "shortTime";
    DateFormat["custom"] = "custom";
})(DateFormat = exports.DateFormat || (exports.DateFormat = {}));
//# sourceMappingURL=enumerations.js.map