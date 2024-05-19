"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.availableCoreAddOnModules = exports.addOnsDefaultFormConfig = exports.addOnsJsonSchemaConfig = void 0;
exports.addOnsJsonSchemaConfig = {
    // -------------------------------------------------
    // --- core:ExportFiles ----------------------------
    // -------------------------------------------------
    'core:ExportFiles': {
        "type": "object",
        "options": {
            "helpSearchWord": "ADD_ONS_HELP_ARTICLES.core:ExportFiles.MAIN_ARTICLE",
            "helpSearchConfigKey": "ADD_ONS_HELP_ARTICLES.core:ExportFiles",
            "disable_collapse": true,
        },
        "properties": {
            "module": {
                "title": "Module Name",
                "type": "string",
                "const": "core:ExportFiles",
                "required": true,
                "options": {
                    "readonly": true
                }
            },
            "description": {
                "title": "Description",
                "type": "string"
            },
            "args": {
                "options": {
                    "disable_collapse": true,
                    "remove_empty_properties": true,
                    "remove_false_properties": true,
                    "remove_ziro_properties": true,
                    "remove_default_properties": true
                },
                "required": true,
                "format": "grid",
                "type": "object",
                "title": "Args",
                "properties": {
                    "operation": {
                        "options": {
                            "grid_columns": 4,
                            "has_placeholder_option": true
                        },
                        "required": true,
                        "type": "string",
                        "enum": ["Insert", "Upsert", "Delete", "Update"],
                        "default": "Insert"
                    },
                    "externalId": {
                        "options": {
                            "grid_columns": 4
                        },
                        "type": "string",
                    },
                    "deleteOldData": {
                        "options": {
                            "grid_columns": 4,
                            "has_placeholder_option": true,
                            "no_empty_option": true
                        },
                        "type": "boolean",
                    },
                    "sourceWhere": {
                        "options": {
                            "grid_columns": 6,
                            "expand_height": true
                        },
                        "type": "string",
                        "format": "textarea"
                    },
                    "targetWhere": {
                        "options": {
                            "grid_columns": 6,
                            "expand_height": true
                        },
                        "type": "string",
                        "format": "textarea",
                        "minLength": 1
                    },
                    "maxFileSize": {
                        "options": {
                            "grid_columns": 6
                        },
                        "type": "number",
                        "maximum": 37000000,
                        "minimum": 0,
                    },
                    "maxChunkSize": {
                        "options": {
                            "grid_columns": 6
                        },
                        "type": "number",
                        "maximum": 37000000,
                        "minimum": 0,
                    },
                }
            }
        }
    },
    // ----------------------------------------------
    // --- core:RecordsTransform -------------------------
    // ----------------------------------------------
    "core:RecordsTransform": {
        "type": "object",
        "options": {
            "helpSearchWord": "ADD_ONS_HELP_ARTICLES.core:RecordsTransform.MAIN_ARTICLE",
            "helpSearchConfigKey": "ADD_ONS_HELP_ARTICLES.core:RecordsTransform",
            "disable_collapse": true
        },
        "properties": {
            "module": {
                "title": "Module Name",
                "type": "string",
                "const": "core:RecordsTransform",
                "required": true,
                "options": {
                    "readonly": true
                }
            },
            "description": {
                "title": "Description",
                "type": "string"
            },
            "args": {
                "options": {
                    "disable_collapse": true,
                    "remove_empty_properties": true,
                    "remove_false_properties": true,
                    "remove_ziro_properties": true,
                    "remove_default_properties": true
                },
                "required": true,
                "format": "grid",
                "type": "object",
                "title": "Args",
                "properties": {
                    "fields": {
                        "type": "array",
                        "title": "Fields",
                        "required": true,
                        "options": {
                            "disable_array_reorder": true
                        },
                        "items": {
                            "type": "object",
                            "format": "grid",
                            "title": "Field",
                            "minItems": 1,
                            "options": {
                                "collapsed": true,
                                "remove_empty_properties": true,
                                "remove_false_properties": true,
                                "remove_ziro_properties": true,
                                "remove_default_properties": true
                            },
                            "properties": {
                                "alias": {
                                    "type": "string",
                                    "required": true,
                                    "options": {
                                        "grid_columns": 4
                                    },
                                    "minLength": 1
                                },
                                "sourceObject": {
                                    "type": "string",
                                    "required": true,
                                    "options": {
                                        "grid_columns": 4
                                    },
                                    "minLength": 1
                                },
                                "sourceField": {
                                    "type": "string",
                                    "required": true,
                                    "options": {
                                        "grid_columns": 4
                                    },
                                    "minLength": 1
                                },
                                "lookupExpression": {
                                    "type": "string",
                                    "options": {
                                        "grid_columns": 4
                                    },
                                },
                                "lookupSource": {
                                    "type": "string",
                                    "enum": ["source", "target"],
                                    "options": {
                                        "grid_columns": 4
                                    },
                                    "default": "source"
                                },
                                "isConstant": {
                                    "type": "boolean",
                                    "options": {
                                        "grid_columns": 4,
                                        "has_placeholder_option": true,
                                        "no_empty_option": true
                                    },
                                },
                                "includeFields": {
                                    "type": "array",
                                    "title": "Included Field",
                                    "items": {
                                        "type": "string",
                                        "title": "Field",
                                        "options": {
                                            "collapsed": true,
                                        },
                                    },
                                    "options": {
                                        "grid_columns": 12,
                                        "disable_array_reorder": true,
                                        "remove_empty_array_items": true
                                    },
                                }
                            },
                        }
                    },
                    "transformations": {
                        "type": "array",
                        "title": "Transformations",
                        "required": true,
                        "items": {
                            "type": "object",
                            "format": "grid",
                            "title": "Transformation",
                            "minItems": 1,
                            "options": {
                                "collapsed": true,
                                "remove_empty_properties": true,
                                "remove_false_properties": true,
                                "remove_ziro_properties": true,
                                "remove_default_properties": true
                            },
                            "properties": {
                                "targetObject": {
                                    "type": "string",
                                    "required": true,
                                    "options": {
                                        "grid_columns": 3
                                    },
                                    "minLength": 1
                                },
                                "targetField": {
                                    "type": "string",
                                    "required": true,
                                    "options": {
                                        "grid_columns": 3
                                    },
                                    "minLength": 1
                                },
                                "formula": {
                                    "type": "string",
                                    "required": true,
                                    "options": {
                                        "grid_columns": 3
                                    },
                                    "minLength": 1
                                },
                                "expressions": {
                                    "type": "array",
                                    "title": "Expressions",
                                    "options": {
                                        "disable_array_reorder": true,
                                        "remove_empty_array_items": true,
                                    },
                                    "items": {
                                        "type": "string",
                                        "title": "Expression",
                                        "options": {
                                            "collapsed": true,
                                            "grid_columns": 12
                                        },
                                        "minLength": 1
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    // ------------------------------------------------
    // ------- core:RecordsFilter (BadWords) ----------
    // ------------------------------------------------
    "BadWords": {
        "type": "object",
        "options": {
            "helpSearchWord": "ADD_ONS_HELP_ARTICLES.BadWords.MAIN_ARTICLE",
            "helpSearchConfigKey": "ADD_ONS_HELP_ARTICLES.BadWords",
            "disable_collapse": true
        },
        "properties": {
            "module": {
                "title": "Module Name",
                "type": "string",
                "const": "core:RecordsFilter",
                "required": true,
                "options": {
                    "readonly": true
                }
            },
            "description": {
                "title": "Description",
                "type": "string"
            },
            "args": {
                "options": {
                    "disable_collapse": true,
                    "remove_empty_properties": true,
                    "remove_false_properties": true,
                    "remove_ziro_properties": true,
                    "remove_default_properties": true
                },
                "required": true,
                "format": "grid",
                "type": "object",
                "title": "Args",
                "properties": {
                    "filterType": {
                        "title": "Filter Type",
                        "type": "string",
                        "const": "BadWords",
                        "required": true,
                        "options": {
                            "readonly": true
                        }
                    },
                    "settings": {
                        "title": "Settings",
                        "type": "object",
                        "required": true,
                        "format": "grid",
                        "options": {
                            "disable_collapse": true,
                            "remove_empty_properties": true,
                            "remove_false_properties": true,
                            "remove_ziro_properties": true,
                            "remove_default_properties": true,
                            "remove_empty_array_items": true
                        },
                        "properties": {
                            "detectFields": {
                                "type": "array",
                                "minItems": 1,
                                "options": {
                                    "disable_array_reorder": true,
                                    "grid_columns": 6
                                },
                                "items": {
                                    "title": "Detect Field",
                                    "type": "string",
                                    "minLength": 1
                                },
                                "required": true
                            },
                            "badwordsFile": {
                                "type": "string",
                                "minLength": 1,
                                "options": {
                                    "grid_columns": 6
                                }
                            },
                            "highlightWords": {
                                "type": "boolean",
                                "options": {
                                    "grid_columns": 6
                                }
                            },
                            "outputMatches": {
                                "type": "boolean",
                                "options": {
                                    "grid_columns": 6
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
exports.addOnsDefaultFormConfig = {
    // -------------------------------------------------
    // --- core:ExportFiles ----------------------------
    // -------------------------------------------------
    "core:ExportFiles": {
        "module": "core:ExportFiles",
        "args": {
            "operation": "Insert"
        }
    },
    // ----------------------------------------------
    // --- core:RecordsTransform -------------------------
    // ----------------------------------------------
    "core:RecordsTransform": {
        "module": "core:RecordsTransform",
        "args": {
            "fields": [
                {
                    "alias": "",
                    "sourceObject": "",
                    "sourceField": ""
                }
            ],
            "transformations": [
                {
                    "targetObject": "",
                    "targetField": "",
                    "formula": ""
                }
            ]
        }
    },
    // ----------------------------------------------
    // --- BadWords Filter -------------------------
    // ----------------------------------------------
    "BadWords": {
        "module": "core:RecordsFilter",
        "args": {
            "filterType": "BadWords",
            "settings": {
                "detectFields": [""]
            }
        }
    }
};
exports.availableCoreAddOnModules = {
    object: {
        "beforeAddons": [],
        "afterAddons": [{
                value: 'core:ExportFiles',
                label: 'core:ExportFiles Add-On',
            }],
        "beforeUpdateAddons": [{
                value: 'core:RecordsTransform',
                label: 'core:RecordsTransform Add-On',
            }],
        "afterUpdateAddons": [{
                value: 'core:ExportFiles',
                label: 'core:ExportFiles Add-On',
            }],
        "filterRecordsAddons": [{
                value: 'BadWords',
                label: 'core:RecordsFilter (BadWords)',
            }]
    },
    script: {
        "beforeAddons": [],
        "dataRetrievedAddons": [{
                value: 'core:RecordsTransform',
                label: 'core:RecordsTransform Add-On',
            }],
        "afterAddons": [{
                value: 'core:ExportFiles',
                label: 'core:ExportFiles Add-On',
            }],
    }
};
//# sourceMappingURL=json-schema-config.js.map