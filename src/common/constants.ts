import { IWindowSize } from "../models";
import { MessageType } from "./enumerations";

/**  Application constants. */
export const CONSTANTS = {

    // Application constants. These are used to configure the application.
    SPLASH_DELAY: 3000,
    TOASTS_DELAY: 6000,
    LONG_OPERATION_MESSAGE_THRESHOLD: 15000,
    BOTTOM_TOAST_ANIMATION_DURATION: 500,
    LOG_FILENAME_TEMPLATE: `application-%DATE%.log`,
    LEFT_SIDEBAR_WIDTH: '220px',
    RIGHT_SIDEBAR_WIDTH: '640px',
    DISPLAY_LOG_DIV_HEIGHT: 'calc(100vh - 300px)',
    INPUT_DEBOUNCE_DELAY: 500,
    QUERY_TEST_MAX_RECORDS_COUNT: 50,

    // Paths constants. These are used to configure the paths of the application.
    APP_BASE_PATH: '.',
    APP_JS_PATH: './js',
    APP_IMAGES_PATH: 'images',
    APP_I18N_PATH: 'i18n',
    APP_LOGS_PATH: 'logs',
    WORKSPACES_PATH: 'workspaces',
    APP_DB_BACKUP_PATH: 'db_backup',
    DEFAULT_DATABASE_FILENAME: 'db.json',
    VIEWS_PATH: 'views',
    THEMES_HREF: './themes',
    EXPORT_JSON_FILENAME: 'export.json',

    // Window constants. These are used to configure the windows of the application.
    WINDOW_DEFAULT_SIZE: {
        width: 550,
        height: 550
    } as IWindowSize,


    // LogService constants. These are used to configure the logger.
    LOGGER: {
        /**
         * Configuration options for the logger.
         */
        Config: {
            // 'YYYY-MM-DD-HH' sets the pattern for the date to be used in the filename.
            datePattern: 'YYYY-MM-DD-HH',
            // Setting this to true enables zipping the archived log files.
            zippedArchive: true,
            // '20m' sets that the log will be rotated after reaching 20m in size.
            maxSize: '20m',
            // '14d' sets that log files older than 14 days will be automatically deleted.
            maxFiles: '14d'
        },
        /**
         * Timestamp format for the logger.
         */
        WinstonFormatTimestamp: {
            format: 'YYYY-MM-DD:HH:mm:ss.SSSZ',
        },
        /**
         * Pattern for formatting unhandled error messages.
         * @param message - The error message.
         * @returns The formatted error message.
         */
        UnhandledErrorMessagePattern: (message: string) => `ERROR!\n${message}`,
        /**
         * Pattern for formatting console log messages.
         * @param message - The log message.
         * @returns The formatted log message.
         */
        ConsoleLogMessagePattern: (message: string, messageType: MessageType) => `LOG MESSAGE:${messageType.toUpperCase()}: ${message}`,
        /**
         * Pattern for formatting file log messages.
         * @param functionName - The name of the function.
         * @param lineNumber - The line number.
         * @param message - The log message.
         * @returns The formatted log message.
         */
        FileLogMessagePattern: (functionName: any, lineNumber: any, message: any) => `[${functionName}:${lineNumber}] ${message}`,

        /**
         *  Pattern for formatting unformatted log messages.
         * @param functionName - The name of the function, not used, to keep the interface consistency.
         * @param lineNumber - The line number - not used, to keep the interface consistency. 
         * @param message - The log message.
         * @returns The formatted log message
         */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        UnformattedFileLogMessagePattern: (functionName: any, lineNumber: any, message: any) => message,
    },


    // Caller constants. These are used to get the function caller information. Used for debugging purposes.
    CALLER_LEVEL: {
        currentFunction: 1,
        parentFunction: 2,
        grandParentFunction: 3
    },


    // Local state keys. These are used to store data in the local state.
    LOCAL_STATE_KEYS: {
        ActiveLanguage: "activeLanguage"
    },

    /** Configuration for the GitHub repository polling. */
    GIT_HUB_REPO_POLLING: {
        /** The interval between polls in milliseconds. */
        interval: 10000,
        /** The maximum number of retries. */
        maxRetries: 10
    },

    ANGULAR_APP: {
        appName: 'appRoot'
    },

    SFDMU: {

        /**
         * The default concurrency mode for bulk API.
         */ 
        DEFAULT_BULK_API_CONCURRENCY_MODE: 'Parallel',

        /**
        * Default name for the default entity.
        */
        DEFAULT_ENTITY_NAME: 'Default',

        /**
         * Default polling interval in milliseconds.
         */
        DEFAULT_POLLING_INTERVAL_MS: 5000,

        /**
         * Default threshold for using Bulk API based on the number of records.
         */
        DEFAULT_BULK_API_THRESHOLD_RECORDS: 200,

        /**
         * Default threshold for using Bulk Query API based on the number of records.
         */
        QUERY_BULK_API_THRESHOLD: 30000,

        /**
         * Maximum record size for batch queries.
         */
        BATCH_QUERY_MAX_RECORD_SIZE: 2000,

        /**
         * Default version for Bulk API.
         */
        DEFAULT_BULK_API_VERSION: '2.0',

        /**
         * Default API version for Salesforce.
         */
        DEFAULT_API_VERSION: '59.0',

        /**
         * Default maximum number of parallel blob downloads.
         */
        DEFAULT_MAX_PARALLEL_BLOB_DOWNLOADS: 20,

        /**
         * Maximum fetch size for REST API queries.
         */
        REST_API_MAX_FETCH_SIZE: 100000,

        /**
         * Timeout for bulk query API polling in milliseconds.
         */
        BULK_QUERY_API_POLL_TIMEOUT: 4 * 60 * 1000,

        /**
         * Default batch size for bulk API.
         */
        BULK_API_V1_DEFAULT_BATCH_SIZE: 9500,

        /**
         * Default batch size for rest API.
         */
        REST_API_DEFAULT_BATCH_SIZE: 9500,

        /**
         * Connection name for CSV file connections.
         */
        CSV_FILE_ORG_NAME: 'csvfile',

        /** 
         *  Option displayed in the data source selection for CSV file connections.         
        */
        CSV_FILE_OPTION_NAME: 'CSV_FILE',        

        /**
         * Default CSV file delimiter.
         */ 
        DEFAULT_CSV_FILE_DELIMITER: ',',

        /*
         *  Default polling query timeout in milliseconds.
            Used to poll for Bulk Query API results.
         */
        DEFAULT_POLLING_QUERY_TIMEOUT_MS: 4 * 60 * 1000,
        

        /**
         * Fields to ignore for polymorphic relationships.
         */
        FIELDS_IGNORE_POLYMORPHIC: [
            'OwnerId',
            "FeedItemId"
        ],

        /**
         * Headers for Salesforce API calls.
         */
        SFORCE_API_CALL_HEADERS: {
            "Sforce-Call-Options": "client=SFDMU"
        },

        /**
         * Name of the "RecordType" sObject in Salesforce.
         */
        RECORD_TYPE_SOBJECT_NAME: "RecordType",

        /**
         * Default external ID field name for record type identification.
         */
        DEFAULT_RECORD_TYPE_ID_EXTERNAL_ID_FIELD_NAME: "DeveloperName;NamespacePrefix;SobjectType",

        /**
         * Default external IDs for specific sObjects.
         */
        DEFAULT_EXTERNAL_IDS: {
            'EmailMessage': 'Subject'
        },

        /**
         *  List of multi-select keywords.
         */
        MULTISELECT_KEYWORDS: [
            'all',
            'readonly_true',
            'readonly_false',
            'custom_true',
            'custom_false',
            'creatable_true',
            'creatable_false',
            'updateable_true',
            'updateable_false',
            'lookup_true',
            'lookup_false',
            'type_string',
            'type_boolean',
            'type_double',
            'type_picklist',
            'type_textarea',
            'type_phone',
            'type_email',
            'type_url',
            'type_currency',
            'type_id',
            'type_integer',
            'type_date',
            'type_datetime',
            'type_time',
            'type_base64',
            'type_multipicklist',
            'type_percent',
            'type_location',
            'type_long',
            'type_address',
            'type_anytype'
        ],

        FIELDS_NOT_TO_USE_IN_FIELD_MOCKING: [
            "Body"
        ],



    },


    DATABASE: {
        APP_DB_TRANSFORMATION_OPTION: {
            groups: ["db"],
            exposeUnsetFields: false
        },

        EXPORT_JSON_TRANSFORMATION_OPTION: {
            groups: ["export"],
            exposeUnsetFields: false
        },

        EXPORT_JSON_ORGS_TRANSFORMATION_OPTION: {
            groups: ["export+orgs"],
            exposeUnsetFields: false
        },

    }

};