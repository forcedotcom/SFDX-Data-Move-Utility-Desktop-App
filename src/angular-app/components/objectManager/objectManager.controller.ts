import { IScope } from 'angular';
import { DataSource, ErrorSource, FaIcon, View, WizardStepByView } from '../../../common';
import { IActionEventArgParam, IOption, ISObjectOption, SObjectOptionData } from '../../../models';
import { DatabaseService, LogService } from '../../../services';
import { AngularUtils, SfdmuUtils } from '../../../utils';
import { IAppService } from '../../services';


export class ObjectManagerController {

    static $inject = ['$app', '$scope'];

    static wizardStep = WizardStepByView[View.configuration];

    constructor(private $app: IAppService, private $scope: IScope) { }

    objectsList: ISObjectOption[] = [];
    oldObjectsList: IOption[] = [];

    selectedObjects: string[] = [];
    selectedObjectOption: IOption | null = null;
    selectedObjectSetId: string | null = null;

    toggleObjectSelectorButtonSymbol = '❮';



    get view(): 'editor' | 'select-object-set-warning' | 'add-objects-warning' {
        const config = DatabaseService.getConfig();
        const objectSet = DatabaseService.getObjectSet();
        return !config.objectSetId ? 'select-object-set-warning'
            : objectSet.objects.length == 0 ? 'add-objects-warning'
                : 'editor';
    }

    async $onInit() {

        LogService.info('Initializing ObjectManagerController...');

        this.setup();

        this.$app.$broadcast.onAction('buildViewComponents', null, () => {
            this.setup();
        }, this.$scope);

        // When the object set is changed, setup the component
        this.$app.$broadcast.onAction('onObjectListRefresh', null, (args: IActionEventArgParam<IOption>) => {
            this.selectedObjectOption = args.args[0] as IOption;
            if (this.selectedObjectOption) {
                this.$app.$timeout(() => {
                    this.setup(this.oldObjectsList);
                }, 100);
            }
        }, this.$scope);

    }

    /**
     *  Setup the component
     * @param objectList  The list of objects to use to setup the component, 
     *                    if not provided, used the previously used list
     */
    private setup(objectList?: IOption[]) {

        if (global.appGlobal.wizardStep == ObjectManagerController.wizardStep) {

            const translate = {
                custom: this.$app.$translate.translate({ key: 'CUSTOM_OBJECT' }),
                standard: this.$app.$translate.translate({ key: 'STANDARD_OBJECT' }),
                excluded: this.$app.$translate.translate({ key: 'EXCLUDED_OBJECT' }),
                unknown: this.$app.$translate.translate({ key: 'UNKNOWN_OBJECT' }),

                customPlural: this.$app.$translate.translate({ key: 'CUSTOM_OBJECTS' }),
                standardPlural: this.$app.$translate.translate({ key: 'STANDARD_OBJECTS' }),
                excludedPlural: this.$app.$translate.translate({ key: 'EXCLUDED_OBJECTS' }),
                withErrorPlural: this.$app.$translate.translate({ key: 'OBJECTS_WITH_ERRORS' }),

                withNoError: this.$app.$translate.translate({ key: 'THIS_SOBJECT_LOOKS_LIKE_HAS_NO_ERRORS' }),

                missingInSource: this.$app.$translate.translate({ key: 'SOBJECT_MISSING_IN_SOURCE_ORG' }),
                missingInTarget: this.$app.$translate.translate({ key: 'SOBJECT_MISSING_IN_TARGET_ORG' }),
                missingInBoth: this.$app.$translate.translate({ key: 'SOBJECT_MISSING_IN_BOTH_ORGS' }),

                childObject: this.$app.$translate.translate({ key: 'CHILD_OBJECT' }),
                hasFieldMapping: this.$app.$translate.translate({ key: 'HAS_FIELD_MAPPING' }),

                operation: this.$app.$translate.translate({ key: 'OPERATION' }),
                externalId: this.$app.$translate.translate({ key: 'EXTERNAL_ID' }),
                field: this.$app.$translate.translate({ key: 'FIELD' }),

            };

            const objectSet = DatabaseService.getObjectSet();
            AngularUtils.$apply(this.$scope, () => {

                // Setup the objects list
                const sobject = DatabaseService.getSObject();
                const popoverHtml = (object, describe) => {
                    return `<b>${translate.field}:</b>${object.name} (${describe?.label || object.name})
                            <br /><b>${translate.operation}:</b> ${object.operation}
                            <br /><b>${translate.externalId}:</b> ${object.externalId}
                            `;
                };

                this.objectsList = (objectList || objectSet.objects.leftJoin([...this.$app.orgDescribe.objectsMap.values()],
                    (object, describe) => object.name == describe.name,
                    (object, describe) => {
                        return {
                            value: object.name,
                            popover: popoverHtml(object, describe),
                            label: describe?.label || object.name,
                            inactive: object.excluded,
                            active: object.id == sobject.id,

                            group: object.excluded ? translate.excludedPlural
                                : !describe || describe.dataSource != DataSource.both ? translate.withErrorPlural
                                    : describe.custom ? translate.customPlural
                                        : translate.standardPlural,

                            icons: [],

                            // All icons are generated dynamically since they depend on the object describe, settings
                            // and errors detected for this object
                            // -------------------------------------------------
                            _getIcons: function () {
                                const self = this as ISObjectOption;
                                return [
                                    {
                                        icon: !describe ? FaIcon.question : describe.custom ? FaIcon.cog : FaIcon.cube,
                                        iconClass: !describe ? 'text-black-50' : 'text-info',
                                        popover: !describe ? translate.unknown : describe.custom ? translate.custom : translate.standard
                                    },
                                    {
                                        get icon() { return self.hasErrors ? FaIcon.exclamationTriangle : FaIcon.check }, set icon(a) { },
                                        get iconClass() { return self.hasErrors ? 'text-warning' : 'text-success' }, set iconClass(a) { },
                                        get popover() { return self.hasErrors ? self.errorMessage : translate.withNoError }, set popover(a) { },
                                        get iconTooltipCustomClass() { return self.hasErrors ? 'tooltip-objectErrors' : 'tooltip-object' }, set iconTooltipCustomClass(a) { },

                                    },
                                    {
                                        get icon() {
                                            if (self.data.isMaster != undefined) {
                                                return !self.data.isMaster ? FaIcon.child : null;
                                            }
                                            return !object.master ? FaIcon.child : null;
                                        }, set icon(a) { },
                                        iconClass: 'text-info',
                                        popover: translate.childObject
                                    },
                                    {
                                        get icon() {
                                            if (self.data.hasMapping != undefined) {
                                                return self.data.hasMapping ? FaIcon.mapping : null;
                                            }
                                            return object.hasFieldMapping ? FaIcon.mapping : null;
                                        }, set icon(a) { },
                                        iconClass: 'text-info',
                                        popover: translate.hasFieldMapping
                                    },
                                    {
                                        icon: object.excluded ? FaIcon.ban : null,
                                        iconClass: 'text-muted',
                                        popover: translate.excluded
                                    },
                                ].filter(icon => !!icon.icon)
                            },

                            data: new SObjectOptionData(describe, translate),

                            get errorMessage(): string {
                                const self = this as ISObjectOption;
                                return [
                                    self.data.objectError,
                                    self.data.fieldErrors,
                                    self.data.settingsErrors
                                ].map((error: string) => {
                                    if (!error) return error;
                                    return '⚠️ ' + error.split('\n').filter(error => !!error.trim())
                                        .join('<br />⚠️ ')
                                }).filter((error: string) => !!error).join('<br />');
                            },

                            get hasErrors() {
                                return !!this.errorMessage;
                            },

                        } as ISObjectOption;

                    })).map((objectOption: IOption) => {
                        if (objectOption.value == this.selectedObjectOption?.value) {
                            // Set the setting errors dynamically
                            this.setObjectErrors(objectOption);
                        }
                        // Generate the icons dynamically based on the object describe and errors detected for this object
                        objectOption.icons = objectOption["_getIcons"]();
                        return objectOption;
                    });

                // Make a shallow backup of the objects list 
                this.oldObjectsList = [...this.objectsList];

                // Nothing selected if this is another selected sobject
                if (this.selectedObjectSetId != objectSet.id) {
                    this.selectedObjectSetId = objectSet.id;
                    this.selectedObjects = [];
                }

                // Report errors to the main toolbar                
                this.displayConfigurationErrors();

            });
        }
    }

    /**
     *  Set the object errors
     * @param objectOption  The object option to set the errors
     */
    private setObjectErrors(objectOption: ISObjectOption) {

        const sObject = DatabaseService.getSObject(objectOption?.value);
        const objectDescribe = this.$app.orgDescribe.objectsMap.get(sObject.name);

        objectOption.data.fieldErrors = '';
        objectOption.data.settingsErrors = '';

        // Check SOQL query
        if (!SfdmuUtils.validateSoql(sObject.query)) {
            objectOption.data.settingsErrors += '\n' + this.$app.$translate.translate({ key: 'INVALID_SOQL_QUERY' });
        }

        // Check delete query
        if (sObject.deleteQuery && !SfdmuUtils.validateSoql(sObject.deleteQuery)) {
            objectOption.data.settingsErrors += '\n' + this.$app.$translate.translate({ key: 'INVALID_DELETE_QUERY' });
        }

        // Check external id
        const externalIdDescribe = objectDescribe?.fieldsMap.get(sObject.externalId);
        if (sObject.externalId
            && !sObject.externalId.includes('.')
            && !sObject.externalId.includes(';')
            && (!externalIdDescribe || externalIdDescribe.dataSource != DataSource.both)) {
            objectOption.data.settingsErrors += '\n' + this.$app.$translate.translate({ key: 'INVALID_EXTERNAL_ID_FIELD' });
        }

        // Check anonymization field descriptions
        if (objectOption.data.anonymizationWithoutFieldDescriptions.length > 0) {
            objectOption.data.settingsErrors += '\n' + this.$app.$translate.translate({
                key: 'ANONYMIZATION_MISSING_FIELD_DESCRIPTIONS',
                params: {
                    FIELD_NAMES: objectOption.data.anonymizationWithoutFieldDescriptions.take(3).join(', ')
                }
            });
        }

        // Check fields
        if (objectOption.data.missingFieldsInSource?.length) {
            objectOption.data.fieldErrors += '\n' + this.$app.$translate.translate({
                key: 'SOBJECT_HAS_FIELDS_MISSING_IN_SOURCE_ORG',
                params: {
                    FIELD_NAMES: objectOption.data.missingFieldsInSource.take(3).join(', ')
                }
            });
        }

        if (objectOption.data.missingFieldsInTarget?.length) {
            objectOption.data.fieldErrors += '\n' + this.$app.$translate.translate({
                key: 'SOBJECT_HAS_FIELDS_MISSING_IN_TARGET_ORG',
                params: {
                    FIELD_NAMES: objectOption.data.missingFieldsInTarget.take(3).join(', ')
                }
            });
        }

        // Check polymorphic fields
        if (objectOption.data.polymorphicFieldsWithoutDefinitions) {
            objectOption.data.fieldErrors += '\n' + this.$app.$translate.translate({
                key: 'MISSING_POLYMORPHIC_FIELDS_DEFINITIONS'
            });
        }

        if (objectOption.data.polymorphicFieldsMissingReference) {
            objectOption.data.fieldErrors += '\n' + this.$app.$translate.translate({
                key: 'POLYMORPHIC_FIELDS_HAS_MISSING_REFERENCED_OBJECTS'
            });
        }


        // Check field mapping
        if (objectOption.data.mappingWithoutSObjectInTarget) {
            objectOption.data.settingsErrors += '\n' + this.$app.$translate.translate({
                key: 'MAPPED_SOBJECT_MISSING_IN_TARGET_ORG',
                params: {
                    SOBJECT_NAME: sObject.targetObject
                }
            });
        }

        if (objectOption.data.mappedFieldsMissingInTarget?.length > 0) {
            objectOption.data.settingsErrors += '\n' + this.$app.$translate.translate({
                key: 'MAPPED_FIELDS_MISSING_IN_THE_TARGET_ORG',
                params: {
                    FIELD_NAMES: objectOption.data.mappedFieldsMissingInTarget.take(3).join(', ')
                }
            });
        }

    }

    /**
     * Display all configuration errors
     */
    private displayConfigurationErrors() {

        this.$app.$timeout(() => {

            // Display errors of the object list in the main toolbar -----------------------------
            // Errors in sObjects
            if (this.objectsList.some(object => !object.inactive && !!object.data.objectError)) {
                this.$app.setViewErrors(ErrorSource.objectList);
            } else {
                this.$app.clearViewErrors(ErrorSource.objectList);
            }

            // Errors in sObjects fields
            if (this.objectsList.some(object => !object.inactive && !!object.data.fieldErrors)) {
                this.$app.setViewErrors(ErrorSource.objectFields);
            } else {
                this.$app.clearViewErrors(ErrorSource.objectFields);
            }

            // Errors in sObject settings
            if (this.objectsList.some(object => !object.inactive && !!object.data.settingsErrors)) {
                this.$app.setViewErrors(ErrorSource.objectSettings);
            } else {
                this.$app.clearViewErrors(ErrorSource.objectSettings);
            }

            // Display errors in main toolbar ----------------------------------------------------
            this.$app.buildMainToolbar();

        }, 50);

    }


    /**
     *  Whether current object set has objects
     */
    get hasObjectSelected() {
        const object = DatabaseService.getSObject();
        return object.isInitialized;
    }


    // Event Handlers ------------------------------------------------------------------------
    handleObjectSelectorToggle() {
        const objectSelector: HTMLElement = document.querySelector('.object-selector-container');
        if (objectSelector.classList.contains('collapsed')) {
            objectSelector.classList.remove('collapsed');
            this.toggleObjectSelectorButtonSymbol = '❮';
        } else {
            objectSelector.classList.add('collapsed');
            this.toggleObjectSelectorButtonSymbol = '❯';
        }
    }


}
