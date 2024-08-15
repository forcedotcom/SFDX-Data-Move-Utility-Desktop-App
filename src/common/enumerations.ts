
// Application enumerations ----------------------------------------------------------
/**  Enumeration of application path types. */
export enum AppPathType {
    dataRootPath = 'dataRootPath',
    appPath = 'appPath',
    scriptPath = 'scriptPath',
    logsPath = 'logsPath',
    imagesPath = 'imagesPath',
    themesPath = 'themesPath',
    i18nPath = 'i18nPath',
    dbBackupPath = 'dbBackupPath',
}


/** Enumeration of application views. */
export enum View {
    /** Home view. */
    home = "home",
    /** Connect view. */
    connection = "connection",
    /** Configuration view. */
    configuration = 'configuration',
    /** Preview view. */
    preview = 'preview',
    /** Run view. */
    run = 'run'
}


/** Enumeration of application views by wizard step number. */
export const ViewByWizardStep = {
    [1]: View.home,
    [2]: View.connection,
    [3]: View.configuration,
    [4]: View.preview,
    [5]: View.run,
}


/** Enumeration of wizard steps by view number. */
export const WizardStepByView = {
    [View.home]: 1,
    [View.connection]: 2,
    [View.configuration]: 3,
    [View.preview]: 4,
    [View.run]: 5,
}



// Messagging enumerations -------------------------------------------------------
/**
 * Enumeration of message types.
 */
export enum MessageType {
    info = 'info',
    warning = 'warning',
    error = 'error'
}

/**
 * Enumeration of dialog types.
 */
export enum DialogType {
    yesno = 'yesno',
    okcancel = 'okcancel',
    success = 'success',
    error = 'error',
    warning = 'warning',
    info = 'info',
    input = 'input',
    select = 'select',
    autocomplete = 'autocomplete',
    multiselect = 'multiselect',
    danger = 'error',
    question = 'question',
}

/**
 * Enumeration of dialog button options.
 */
export enum DialogButton {
    ok = 'ok',
    cancel = 'cancel',
    yes = 'yes',
    no = 'no',
    exit = 'exit',
    reload = 'reload',
}

/**
 * Enumeration of dialog results.
 */
export enum DialogResult {
    ok = 'ok',
    cancel = 'cancel',
    yes = "ok",
    no = 'no',
    exit = 'ok',
    reload = 'ok',
}


// Event enumerations -------------------------------------------------------
/**
 * Enumeration of event types for long operations.
 * Specifies different types of events during a long operation, such as start, progress, notification, end, etc.
 */
export enum ProgressEventType {
    start = "start",
    progress = "progress",
    ui_notification = "ui_notification",
    end = "end",
    stdOutData = "stdOutData",
    stdErrData = "stdErrData",
    error = "error",
}


// SFDMU enumerations -------------------------------------------------------
/**
 * Enumeration of source types.
 * Specifies the type of data source as source, target, or unknown.
 */
export enum SourceType {
    Source = "Source",
    Target = "Target",
    Unknown = "Unknown",
}

/**
 * Enumeration of connection types.
 * Specifies the type of connection as org, file, one-direction, or unknown.
 */
export enum ConnectionType {
    Org = "Org",
    File = "File",
    OneDirection = "OneDirection",
    Unknown = "Unknown",
}

/**
 * Enumeration of operation types.
 * Specifies the type of operation, such as insert, update, upsert, readonly, delete, delete source, delete hierarchy, hard delete, or unknown.
 */
export enum Operation {
    Insert = "Insert",
    Update = "Update",
    Upsert = "Upsert",
    Readonly = "Readonly",
    Delete = "Delete",
    DeleteSource = "DeleteSource",
    DeleteHierarchy = "DeleteHierarchy",
    HardDelete = "HardDelete",
    Unknown = "Unknown",
}

/**
 * Enumeration of data cache types.
 * Specifies the type of data cache, such as in-memory, clean file cache, or file cache.
 */
export enum DataCacheTypes {
    InMemory = "InMemory",
    CleanFileCache = "CleanFileCache",
    FileCache = "FileCache",
}

export enum DataSource {
    unknown = 'unknown',
    none = 'none',
    source = 'source',
    target = 'target',
    both = 'both',
}



// UI enumerations ---------------------------------------------------
/** Font awesome icons. */
export enum FaIcon {
    /** Info circle icon. */
    infoCircle = 'fas fa-info-circle',
    /** Question circle icon. */
    questionCircle = 'fas fa-question-circle',
    /** Exclamation circle icon. */
    exclamationCircle = 'fas fa-exclamation-circle',
    /** Exclamation triangle icon. */
    exclamationTriangle = 'fas fa-exclamation-triangle',
    /** Check circle icon. */
    checkCircle = 'fas fa-check-circle',
    /** Check icon. */
    check = 'fas fa-check',
    /** Times circle icon. */
    timesCircle = 'fas fa-times-circle',
    /** Edit icon. */
    edit = 'fas fa-edit',
    /** Save icon. */
    save = 'fas fa-save',
    /** Smile icon. */
    smile = 'fas fa-smile',
    /** Trash icon. */
    trash = 'fas fa-trash',
    /** Plus icon. */
    plus = 'fas fa-plus',
    /** Minus icon. */
    minus = 'fas fa-minus',
    /** Close icon. */
    close = 'fas fa-times',
    /** Folder icon. */
    folder = 'fas fa-folder',
    /** Open folder icon. */
    folderOpen = 'fas fa-folder-open',
    /** File import icon. */
    fileImport = 'fas fa-file-import',
    /** File export icon. */
    fileExport = 'fas fa-file-export',
    /** Download icon. */
    download = 'fas fa-download',
    /** Upload icon. */
    upload = 'fas fa-upload',
    /** Search icon. */
    search = 'fas fa-search',
    /** Cog icon. */
    cog = 'fas fa-cog',
    /** Settings icon. */
    settings = 'fas fa-cogs',
    /** Lock icon. */
    lock = 'fas fa-lock',
    /** Unlock icon. */
    unlock = 'fas fa-unlock',
    /** User icon. */
    user = 'fas fa-user',
    /** Users icon. */
    users = 'fas fa-users',
    /** Home icon. */
    home = 'fas fa-home',
    /** List icon. */
    list = 'fas fa-list',
    /** Calendar icon. */
    calendar = 'fas fa-calendar',
    /** Clock icon. */
    clock = 'fas fa-clock',
    /** Map icon. */
    map = 'fas fa-map',
    /** Location arrow icon. */
    locationArrow = 'fas fa-location-arrow',
    /** Phone icon. */
    phone = 'fas fa-phone',
    /** Envelope icon. */
    envelope = 'fas fa-envelope',
    /** Flag icon. */
    flag = 'fas fa-flag',
    /** Comment icon. */
    comment = 'fas fa-comment',
    /** Share icon. */
    share = 'fas fa-share',
    /** Heart icon. */
    heart = 'fas fa-heart',
    /** Pen icon. */
    pen = 'fas fa-pen',
    /** Lightbulb icon. */
    lightbulb = 'fas fa-lightbulb',
    /** Headset icon. */
    headset = 'fas fa-headset',
    /** Sitemap icon. */
    sitemap = 'fas fa-sitemap',
    /** Cloud icon. */
    cloud = 'fas fa-cloud',
    /** Arrow up icon. */
    arrowUp = 'fas fa-arrow-up',
    /** Arrow down icon. */
    arrowDown = 'fas fa-arrow-down',
    /** Database icon. */
    database = 'fas fa-database',
    /** Drag handle icon. */
    dragHandle = 'fas fa-grip-vertical',
    /** Columns icon. */
    columns = 'fas fa-columns',
    /** Fields mapping icon. */
    fieldsMapping = 'fas fa-arrows-alt-h',
    /** Values mapping icon. */
    valuesMapping = 'fas fa-exchange-alt',
    /** Data anonymization icon. */
    dataAnonymization = 'fas fa-user-secret',
    /** Polymorphic field icon. */
    polymorphicField = 'fas fa-code-branch',
    /** Query icon. */
    query = 'fas fa-code',
    /** Code icon */
    code = 'fas fa-code',
    /** Cleanup icon. */
    cleanup = 'fas fa-broom',
    /** Export icon */
    export = 'fas fa-file-export',
    /** Import icon */
    import = 'fas fa-file-import',
    /** Eraser icon */
    eraser = 'fas fa-eraser',
    /** Log file icon */
    logFile = 'fas fa-file-alt',
    /** Test icon. */
    test = 'fas fa-flask',
    /** Link icon. */
    link = 'fas fa-link',
    /** File icon. */
    file = 'fas fa-file',
    /** Sign out icon. */
    faSignOutAlt = 'fas fa-sign-out-alt',
    /** Refresh icon. */
    refresh = 'fas fa-sync-alt',
    /** Github icon. */
    github = 'fab fa-github',
    /** Folder plus icon. */
    folderPlus = 'fas fa-folder-plus',
    /** Folder tree icon. */
    folderTree = 'fas fa-folder-tree',
    /** Sync icon. */
    sync = 'fas fa-sync',
    /** Cube icon. */
    cube = 'fas fa-cube',
    /** Ban icon. */
    ban = 'fas fa-ban',
    /** Play icon */
    play = 'fas fa-play',
    /** Question icon. */
    question = 'fas fa-question',
    /** Icons representing adding item to list. */
    addItemToList = 'fas fa-list-ul with-plus',
    /** Icons representing removing item from list. */
    removeItemFromList = 'fas fa-list-ul with-minus',
    /** Representing a field. */
    field = 'fas fa-columns',
    /** Representing a copy icon. */
    copy = 'fas fa-copy',
    /** Representing a crown icon. */
    crown = 'fas fa-crown',
    /** Representing a star icon. */
    star = 'fas fa-star',
    /** Representing a mapping icon. */
    mapping = 'fas fa-arrows-alt-h',
    /** Representing a terminal icon. */
    terminal = 'fa fa-terminal',
    /** Representing a eye icon. */
    eye = 'fa fa-eye',
    /** Representing a level down icon. */
    child = 'fa fa-level-down-alt',
    /** Representing add-on icon. */
    addOn = 'fas fa-plus-square',
    /** Representing an undo icon. */
    undo = 'fas fa-undo',
    /** Represents navigation icon */
    navigateToPage = "fas fa-external-link-alt"
}

/** Enumeration of button styles. */
export enum BsButtonStyle {
    /** Primary button style. */
    primary = 'btn btn-primary',
    /** Secondary button style. */
    secondary = 'btn btn-secondary',
    /** Success button style. */
    success = 'btn btn-success',
    /** Danger button style. */
    danger = 'btn btn-danger',
    /** Warning button style. */
    warning = 'btn btn-warning',
    /** Info button style. */
    info = 'btn btn-info',
    /** Light button style. */
    light = 'btn btn-light',
    /** Dark button style. */
    dark = 'btn btn-dark',
    /** Link button style. */
    link = 'btn btn-link',
    /** Primary outline button style. */
    outlinePrimary = 'btn btn-outline-primary',
    /** Secondary outline button style. */
    outlineSecondary = 'btn btn-outline-secondary',
    /** Success outline button style. */
    outlineSuccess = 'btn btn-outline-success',
    /** Danger outline button style. */
    outlineDanger = 'btn btn-outline-danger',
    /** Warning outline button style. */
    outlineWarning = 'btn btn-outline-warning',
    /** Info outline button style. */
    outlineInfo = 'btn btn-outline-info',
    /** Light outline button style. */
    outlineLight = 'btn btn-outline-light',
    /** Dark outline button style. */
    outlineDark = 'btn btn-outline-dark',
}

/** Enumeration of button sizes. */
export enum BsSize {
    /** Large size. */
    lg = 'lg',
    /** Small size. */
    sm = 'sm',
    /** Extra small size. */
    xs = 'xs',
    /** Normal size. */
    md = 'md',
}

/** The source of the error. */
export enum ErrorSource {
    objectList = 'objectList',
    objectSets = 'objectSets',
    objectFields = 'objectFields',
    objectSettings = 'objectSettings',
    configurationSettings = 'configurationSettings',
    cliSettings = 'cliSettings'
}

/**
 * Represents the date format for angularjs date filter.
 */
export enum DateFormat {
    medium = 'medium',
    short = 'short',
    fullDate = 'fullDate',
    longDate = 'longDate',
    mediumDate = 'mediumDate',
    shortDate = 'shortDate',
    mediumTime = 'mediumTime',
    shortTime = 'shortTime',
    custom = 'custom'
}

