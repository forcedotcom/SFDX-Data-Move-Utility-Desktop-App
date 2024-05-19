import { IScope } from 'angular';
import { CONSTANTS, DataSource, DialogType, FaIcon, SetupFormOptions, View, WizardStepByView } from '../../../common';
import { addOnsDefaultFormConfig, addOnsJsonSchemaConfig, availableCoreAddOnModules } from '../../../configurations';
import { IActionEventArgParam, IEditFormResult, IOption, ISObjectOption, ITabItem, PolymorphicField, SFieldDescribe, SObjectDescribe, ScriptMappingItem, ScriptObject } from '../../../models';
import { DatabaseService, DialogService, LogService, NetworkStatusService, SfdmuService, ToastService } from '../../../services';
import { AngularUtils, CommonUtils, SfdmuUtils } from '../../../utils';
import { UiEditFormArrayController, UiJsonEditorController, UiTabsController } from '../../directives';
import { IAppService, IJsonEditModalService } from '../../services';



interface IScriptObjectAddonFormData {
	beforeAddons?: string;
	afterAddons?: string;
	beforeUpdateAddons?: string;
	afterUpdateAddons?: string;
	filterRecordsAddons?: string;
}

const UI_CONSTANTS = {
	UI_TRANSFER_PRICKER_HEIGHT: 'calc(max(100vh - 564px, 220px))',
}

export class ObjectManagerEditorController {

	static $inject = ['$app', '$scope', `$jsonEditModal`];

	static wizardStep = WizardStepByView[View.configuration];

	// Common
	FaIcon = FaIcon;
	UI_CONSTANTS = UI_CONSTANTS;
	selectedTabId = "";
	_supressSelectEvent = false;

	// Fields tab
	selectedSObject: SObjectDescribe = new SObjectDescribe();
	selectedSObjectOption: ISObjectOption | null = null;
	fieldsSelectedTabId = "";

	availableFields: IOption[] = [];
	excludedAvailableFields: IOption[] = [];

	selectedFields: string[] = [];
	excludedFields: string[] = [];
	excludedFromUpdateFields: string[] = [];

	polymorphicFieldsJsonArray: any[] = [];
	polymorphicFieldsSetup: SetupFormOptions = {};
	polymorphicFieldsArraySetup: SetupFormOptions = {};

	// Query tab
	queryTabsFormSetup: SetupFormOptions = {};
	oldExternalId = '';

	// Query test tab
	selectedQueryTestTabIndex: number;
	allFields: string[] = [];
	fullSoqlQuery = '';
	queryTestTableSource: any[] = [];
	queryTestTotalRecordsCount = 0;
	queryTestUseSourceConnection = true
	queryUsedConnectionToggleDisabled = false;
	queryTestOrgName = '';
	queryTestRecordsLimit: number = CONSTANTS.QUERY_TEST_MAX_RECORDS_COUNT;

	// Field mapping tab
	fieldMappingTargetObjectsListFormSetup: SetupFormOptions = {};
	fieldMappingTargetObjectsListJson: any = {};

	fieldMappingJsonArray: any[] = [];
	fieldMappingSetup: SetupFormOptions = {};

	fieldMappingArraySetup: SetupFormOptions = {};
	targetObjectNotDescribed = false;

	// Data anonymization tab
	dataAnonymizationJsonArray: any[] = [];
	dataAnonymizationSetup: SetupFormOptions = {};
	dataAnonymizationArraySetup: SetupFormOptions = {};

	// Object settings tab
	objectSettingsJson: any = {};
	objectSettingsSetup: SetupFormOptions = {};
	objectSettingsTitles: string[] = [];

	// Object Add-Ons tab
	isAddOnsChanged = false;
	addOnFormData: IScriptObjectAddonFormData = {};
	addOnsSelectedTabId = "";

	// Add-Ons Visual Editor
	addOnSelectedTabs: string[] = [];

	addOnFormArraySetup: SetupFormOptions = {};
	addOnFormSetup: SetupFormOptions = {};
	addOnFormJsonArray: any[];
	addOnFormNewObject: any = {};

	addOnFormHidden: boolean;
	addOnFormHiddenNew: boolean;

	constructor(private $app: IAppService, private $scope: IScope, private $jsonEditModal: IJsonEditModalService) { }

	get view(): 'select-sobject' | 'editor' | 'cant-edit' {
		if (global.appGlobal.isOffline) {
			return 'cant-edit';
		}
		if (this.selectedSObjectOption == null) {
			return 'select-sobject';
		}
		if (this.selectedSObject.dataSource == 'unknown') {
			return 'cant-edit';
		}
		if (this.selectedSObject.isDescribed) {
			return 'editor';
		}
		if (this.selectedSObject.isInitialized && !this.selectedSObject.isDescribed) {
			return 'cant-edit';
		}
		return 'select-sobject';
	}

	async $onInit() {

		LogService.info('Initializing ObjectManagerEditorController...');

		const netStatus = global.appGlobal.networkStatusService as NetworkStatusService;
		netStatus.on('connectionLost', () => {
			this.$app.$broadcast.broadcastAction('onSelect', 'uiList', {
				componentId: 'objectsList',
				args: [this.selectedSObjectOption]
			});
		});

		netStatus.on('connectionRestored', () => {
			this.$app.$broadcast.broadcastAction('onSelect', 'uiList', {
				componentId: 'objectsList',
				args: [this.selectedSObjectOption]
			});
		});


		this.$scope.$watch('$ctrl.queryTestUseSourceConnection', async (newVal: boolean) => {
			if (newVal != undefined) {
				await this.makeFullQueryAsync(false);
			}
		});

		this.$app.$broadcast.onAction('buildViewComponents', null, () => {
			this.refresh();
			this.$app.buildFooter();
		}, this.$scope);

		this.$app.$broadcast.onAction('tabSelected', 'uiTabs', (args: IActionEventArgParam<ITabItem>) => {
			if (['objectFieldsTabset'].includes(args.componentId)) {
				this.handleTabChange(args);
			}
		}, this.$scope);

		this.$app.$broadcast.onAction('refreshObjectList', null, () => {
			this.refreshObjectList();
		}, this.$scope);


		this.$app.$broadcast.onAction('onSelect', 'uiList', async (args: IActionEventArgParam<IOption>) => {
			if (args.componentId == 'objectsList') {

				LogService.info(`Selecting sobject: ${args.args[0].value}...`);

				// Switch to the fields tab
				this.selectedTabId = 'fields';
				this.fieldsSelectedTabId = 'objectFields';

				// Describe the sobject
				const isSuccess = await this.$app.describeWorkspaceSObjectAsync(args.args[0].value);

				if (!isSuccess) {
					AngularUtils.$apply(this.$scope, () => {
						this.selectedSObjectOption = args.args[0];
						this.selectedSObject = this.$app.orgDescribe.objectsMap.get(this.selectedSObjectOption.value) || new SObjectDescribe();
					});
					return;
				}

				// Get the selected sobject option
				this.selectedSObjectOption = args.args[0];

				this.$app.$spinner.showSpinner(this.$app.$translate.translate({ key: 'SELECTING_SOBJECT' }));
				await CommonUtils.delayAsync(300);

				// Get the sobject describe
				this.selectedSObject = this.$app.orgDescribe.objectsMap.get(this.selectedSObjectOption.value) || new SObjectDescribe();

				// Set the sobject id in the config
				const config = DatabaseService.getConfig();
				const objectSet = DatabaseService.getObjectSet();
				const newSObjectId = objectSet.objects.find(x => x.name == this.selectedSObjectOption.value)?.id;
				const mustupdateDatabase = config.sObjectId != newSObjectId;
				config.sObjectId = newSObjectId;

				// Update the database
				if (mustupdateDatabase) {
					const ws = DatabaseService.getWorkspace();
					DatabaseService.updateConfig(ws.id, config);
				}

				// Log the sobject status
				if (this.selectedSObject.isInitialized && !this.selectedSObject.isDescribed) {
					LogService.info(`SObject ${this.selectedSObject.name} could not be described.`);
				} else if (this.selectedSObject.isInitialized && this.selectedSObject.isDescribed) {
					LogService.info(`SObject ${this.selectedSObject.name} is selected.`);
				} else if (!this.selectedSObject.isInitialized) {
					LogService.info(`SObject ${this.selectedSObject.name} is not initialized.`);
				}

				// Setup the fields
				await this.setup();
				//this.$app.buildFooter();
			}
		}, this.$scope);
	}

	/**
	 * Setup teh component.
	 */
	private async setup() {
		if (global.appGlobal.wizardStep == ObjectManagerEditorController.wizardStep) {

			if (this.selectedSObject?.isDescribed) {

				const translate = {
					missingInSource: this.$app.$translate.translate({ key: 'FIELD_MISSING_IN_SOURCE_ORG' }),
					missingInTarget: this.$app.$translate.translate({ key: 'FIELD_MISSING_IN_TARGET_ORG' }),
					missingInBoth: this.$app.$translate.translate({ key: 'FIELD_MISSING_IN_BOTH_ORGS' }),
					withErrorPlural: this.$app.$translate.translate({ key: 'FIELDS_WITH_ERRORS' }),
				};

				const sObject = DatabaseService.getSObject();
				const ws = DatabaseService.getWorkspace();
				const config = DatabaseService.getConfig();

				const sObjectAndQueryFields = this.getAllSObjectFieldDescriptions()
					.fullJoin(sObject.fields, (fieldDescribe, queryField) => fieldDescribe.name == queryField,
						(fieldDescribe, queryField) => {
							return fieldDescribe || new SFieldDescribe({
								name: queryField,
								label: queryField,
								dataSource: DataSource.unknown
							});
						}).sortBy('label');

				this.availableFields = sObjectAndQueryFields.map(field => {
					field.errorMessages = [field.dataSource == DataSource.source ? translate.missingInTarget
						: field.dataSource == DataSource.target ? translate.missingInSource
							: field.dataSource == DataSource.unknown ? translate.missingInBoth : '']
						.filter(x => !!x);

					return {
						get hasErrors() {
							return field.errorMessages?.length > 0;
						},
						value: field.name,
						label: (field.isPolymorphic ? '<span class="fs-xs">🔗➿</span> '
							: field.isFormula ? '<span class="fs-xs">∑</span> '
								: field.isMultiSelect ? '<span class="fs-xs">✳️</span> '
									: field.isMasterDetail ? '<span class="fs-xs">🔗</span> '
										: field.lookup ? '<span class="fs-xs">🔗</span> '
											: field.custom ? '<span class="fs-xs">⚙️</span> ' : '') + (field.label || '(Blank field name)'),
						group: field.errorMessages.length > 0 ? translate.withErrorPlural
							: field.isPolymorphic ? '<span class="fs-xs">🔗➿</span> Polymorphic'
								: field.isFormula ? '<span class="fs-xs">∑</span> Formula'
									: field.isMultiSelect ? '<span class="fs-xs">✳️</span> Multi-Select'
										: field.isMasterDetail ? '<span class="fs-xs">🔗</span> Master-Detail'
											: field.lookup ? '<span class="fs-xs">🔗</span> Lookup'
												: field.custom ? '<span class="fs-xs">⚙️</span> Custom' : 'Standard',
						errorMessage: field.errorMessages?.join('\n'),
						popover: `${field.name} (${field.label})`
					} as IOption;
				});

				this.excludedAvailableFields = this.availableFields.filter(x => !x.group.includes('Multi-Select'));

				if (!sObject.isExternalIdSet && this.selectedSObject.isValid) {
					sObject.externalId = SfdmuUtils.getDefaultExternalId(sObject.name, this.$app.orgDescribe);
					DatabaseService.updateConfig(ws.id, config);
				}

				this.selectedFields = sObject.fields;
				this.excludedFields = sObject.excludedFields;
				this.excludedFromUpdateFields = sObject.excludedFromUpdateFields;

				await this.makeFullQueryAsync(false);
				this.refreshObjectList();
			}

			this._supressSelectEvent = true;

			AngularUtils.$apply(this.$scope);
			this.$app.$timeout(() => {
				this._supressSelectEvent = false;
				this.$app.$spinner.hideSpinner();
			}, 300, false);
		}
	}


	/**
	 * Refresh the component.
	 */
	private refresh() {
		if (global.appGlobal.wizardStep == ObjectManagerEditorController.wizardStep) {
			const sobject = DatabaseService.getSObject();
			this.selectedSObject = this.$app.orgDescribe.objectsMap.get(sobject.name) || new SObjectDescribe();
			if (this.selectedSObject.dataSource == 'unknown') {
				this.selectedSObjectOption = null;
			}
		}
	}

	/**
	 *  Make a full query for the sobject.
	 * Validates the query and executes it if runQueries is true.
	 * @param runQueries  Indicates whether to execute the query or not.
	 * @returns  A promise that resolves to true if the query was executed successfully, otherwise false.
	 */
	private async makeFullQueryAsync(runQueries: boolean): Promise<boolean> {

		const sObject = DatabaseService.getSObject().clone();
		const ws = DatabaseService.getWorkspace();
		const { connection, dataSource } = ws.getConnectionBySObject(sObject.name, this.$app.orgDescribe);

		if (dataSource != DataSource.both) {
			this.queryUsedConnectionToggleDisabled = true;
			this.queryTestUseSourceConnection = dataSource == DataSource.source;
		} else {
			this.queryUsedConnectionToggleDisabled = false;
		}

		// Get object description
		const description = this.$app.orgDescribe.objectsMap.get(sObject.name) || new SObjectDescribe();
		if (!connection || !description.isInitialized || !description.isDescribed) {
			this.queryTestOrgName = '';
			return false;
		}
		const runOnConnection = this.queryTestUseSourceConnection ? ws.sourceConnection : ws.targetConnection;
		this.queryTestOrgName = runOnConnection.userName;

		// Generate full query string
		LogService.info(`Creating and validating full query for sobject ${sObject.name}...`);
		const fullQuery = SfdmuUtils.createQueryString(sObject);
		const allFields = !fullQuery.sObject.externalId ? fullQuery.sObject.fields : fullQuery.sObject.fields.concat(fullQuery.sObject.externalId.split(';'));
		fullQuery.sObject.fields = SfdmuUtils.getAllQueryStringFields(allFields, description);
		fullQuery.sObject.fields = fullQuery.sObject.fields.exclude(sObject.excludedFields, (field, excluded) => field == excluded);
		const fieldDescription = [...description.fieldsMap.values()];
		this.allFields = fullQuery.sObject.fields;

		const queryFieldDescriptions = allFields
			.leftJoin(fieldDescription, (field, description) => field == description.name,
				(field, description) => description || new SFieldDescribe({
					dataSource: DataSource.unknown,
					name: field,
					label: field
				}));

		const missingInSourceFields = queryFieldDescriptions.filter(x => x.dataSource == DataSource.target || x.dataSource == DataSource.unknown).map(x => x.name);
		const missingInTargetFields = queryFieldDescriptions.filter(x => x.dataSource == DataSource.source || x.dataSource == DataSource.unknown).map(x => x.name);

		if (this.selectedSObjectOption) {
			this.selectedSObjectOption.data.missingFieldsInSource = missingInSourceFields.length > 0 ? missingInSourceFields : null;
			this.selectedSObjectOption.data.missingFieldsInTarget = missingInTargetFields.length > 0 ? missingInTargetFields : null;
		}

		this.setFieldsTabsetTitles();

		if (runQueries) {

			LogService.info(`Executing full query for sobject ${sObject.name}...`);

			// Execute the full query
			await CommonUtils.delayAsync(100);

			this.$app.$spinner.showSpinner();

			// Count query
			const countSoql = SfdmuUtils.createCountQueryString(sObject);
			const countRecords = await SfdmuService.queryAsync(countSoql, runOnConnection);
			if (countRecords.isError) {
				this.$app.$spinner.hideSpinner();
				return false;
			}

			// Limited full query
			const limitedQuery = SfdmuUtils.createLimitedQueryString(sObject, CONSTANTS.QUERY_TEST_MAX_RECORDS_COUNT);
			const allFields = !fullQuery.sObject.externalId ? limitedQuery.sObject.fields : limitedQuery.sObject.fields.concat(limitedQuery.sObject.externalId.split(';'));
			limitedQuery.sObject.fields = SfdmuUtils.getAllQueryStringFields(allFields, description);
			let limitedSoql = SfdmuUtils.createQueryString(limitedQuery.sObject).query;

			limitedSoql = this.buildTargetQueryString(limitedQuery.sObject, limitedSoql);

			const allRecords = await SfdmuService.queryAsync(limitedSoql, runOnConnection);
			if (allRecords.isError) {
				this.$app.$spinner.hideSpinner();
				return false;
			}

			// Update UI
			AngularUtils.$apply(this.$scope, () => {
				this.queryTestTableSource = allRecords.records;
				this.queryTestTotalRecordsCount = sObject.limit > 0 && sObject.limit < countRecords.records[0].cnt
					? sObject.limit : countRecords.records[0].cnt;
				this.fullSoqlQuery = SfdmuUtils.createQueryString(fullQuery.sObject).query;
				this.fullSoqlQuery = this.buildTargetQueryString(fullQuery.sObject, this.fullSoqlQuery);
			});
			this.$app.$timeout(() => {
				this.selectedQueryTestTabIndex = 1;
			}, 300);

		} else {
			// Only display the query string without executing it
			// Update UI
			await CommonUtils.delayAsync(200);
			AngularUtils.$apply(this.$scope, () => {
				this.fullSoqlQuery = SfdmuUtils.createQueryString(fullQuery.sObject).query;
				this.fullSoqlQuery = this.buildTargetQueryString(fullQuery.sObject, this.fullSoqlQuery);
			});
		}

		this.$app.$spinner.hideSpinner();
		return true;
	}


	/**
	 * Refresh the object list.
	 * 	Refreshes the object list by broadcasting the onObjectListRefresh event.
	 * 	The event is handled by the objectManager controller.
	 */
	private refreshObjectList() {
		const setMasterObjectFlag = sobject =>
			this.selectedSObjectOption.data.isMaster = sobject.master;

		const setFieldMappingFlag = sobject =>
			this.selectedSObjectOption.data.hasMapping = sobject.hasFieldMapping;

		const setPolymorphicFieldsErrors = sobject => {
			this.selectedSObjectOption.data.polymorphicFieldsWithoutDefinitions =
				!sobject.excluded &&
				this.getAllSoqlPolymorphicFieldDescriptions().length >
				sobject.polymorphicFields.length;

			this.selectedSObjectOption.data.polymorphicFieldsMissingReference =
				!sobject.excluded &&
				sobject.polymorphicFields.leftJoin(
					this.getAllSObjectsDescriptions(),
					(poly, description) => poly.objectName == description.name,
					(poly, description) => description
				).filter(targetDescription =>
					!targetDescription || targetDescription.dataSource != DataSource.both
				).length > 0;
		};

		const setAnonymizationErrors = sobject => {
			this.selectedSObjectOption.data.anonymizationWithoutFieldDescriptions =
				!sobject.excluded && sobject.updateWithMockData &&
				sobject.mockFields.leftJoin(
					this.getAllSObjectFieldDescriptions(),
					(mockField, description) => mockField.name == description.name,
					(mockField, description) => {
						return {
							mock: mockField,
							sourceDescription: description
						};
					}
				).filter(item =>
					!item.sourceDescription ||
					(
						item.sourceDescription.dataSource != DataSource.both &&
						item.sourceDescription.dataSource != DataSource.source
					)
				).map(x => x.mock.name) || [];
		};

		const setFieldMappingErrors = (sobject, targetObjectDescription) => {
			this.selectedSObjectOption.data.mappingWithoutSObjectInTarget =
				!sobject.excluded && sobject.useFieldMapping &&
				targetObjectDescription.dataSource != DataSource.both &&
				targetObjectDescription.dataSource != DataSource.target;

			this.selectedSObjectOption.data.mappedFieldsMissingInTarget =
				!sobject.excluded && sobject.useFieldMapping &&
				[...sobject.targetFields.values()].leftJoin(
					[...targetObjectDescription.fieldsMap.values()],
					(mappedItem, fieldDescription) =>
						mappedItem.targetField == fieldDescription.name,
					(mappedItem, fieldDescription) => {
						return { mappedItem, fieldDescription };
					}
				).filter(item =>
					!item.fieldDescription ||
					(
						item.fieldDescription.dataSource != DataSource.both &&
						item.fieldDescription.dataSource != DataSource.target
					)
				).map(x => x.mappedItem.targetField) || [];
		};

		const broadcastEvent = () => {
			this.$app.$broadcast.broadcastAction(
				'onObjectListRefresh',
				'objectManagerEditor',
				{ args: [this.selectedSObjectOption] }
			);
		};

		if (this.selectedSObjectOption) {
			const sobject = DatabaseService.getSObject();
			const targetObjectDescription =
				this.$app.orgDescribe.objectsMap.get(sobject.targetObject) ||
				new SObjectDescribe();

			setMasterObjectFlag(sobject);
			setFieldMappingFlag(sobject);
			setPolymorphicFieldsErrors(sobject);
			setAnonymizationErrors(sobject);
			setFieldMappingErrors(sobject, targetObjectDescription);
			broadcastEvent();
		}
	}



	/**
	 *  Get all field descriptions for the currently selected sobject.
	 * @returns  An array of field descriptions.
	 */
	private getAllSObjectFieldDescriptions() {
		return [...this.selectedSObject.fieldsMap.values()]
			.filter(field => field.dataSource != DataSource.unknown);
	}

	/**
	 *  Get all field descriptions for the fields of the soql query.
	 * @returns  An array of field descriptions.
	 */
	private getAllSoqlFieldDescriptions() {
		const sObject = DatabaseService.getSObject();
		return [...this.selectedSObject.fieldsMap.values()]
			.innerJoin(sObject.fields, (describe, queryField) => describe.name == queryField, (describe) => describe)
			.exclude(sObject.excludedFields, (describe, excludedField) => describe.name == excludedField)
			.filter(field => field.dataSource != DataSource.unknown);
	}

	/**
	 * Get all field descriptions for the polymorphic fields of the soql query.
	 * @returns  An array of field descriptions.
	 */
	private getAllSoqlPolymorphicFieldDescriptions() {
		return this.getAllSoqlFieldDescriptions().filter(x => x.isPolymorphic);
	}

	/**
	 * Get all sobject descriptions for the organization.
	 * @returns  An array of sobject descriptions.
	 */
	private getAllSObjectsDescriptions() {
		return [...this.$app.orgDescribe.objectsMap.values()]
			.filter(x => x.dataSource != DataSource.unknown);
	}


	/**
	 *  Set the fields tabset titles.
	 */
	private setFieldsTabsetTitles() {
		this.$app.$timeout(() => {
			const $ctrl = AngularUtils.$getController<UiTabsController>('#objectFieldsTabset');
			const sobject = DatabaseService.getSObject();
			if ($ctrl) {
				$ctrl.setTabTitle('objectFields', `${this.$app.$translate.translate({ key: 'OBJECT_FIELDS' })} (${this.allFields.length})`);
				$ctrl.setTabTitle('excludedFields', `${this.$app.$translate.translate({ key: 'EXCLUDED_FIELDS' })} (${sobject.excludedFields.length})`);
				$ctrl.setTabTitle('excludedFromUpdateFields', `${this.$app.$translate.translate({ key: 'EXCLUDED_FROM_UPDATE_FIELDS' })} (${sobject.excludedFromUpdateFields.length})`);
				$ctrl.setTabTitle('polymorphicFields', `${this.$app.$translate.translate({ key: 'POLYMORPHIC_FIELDS' })} (${this.getAllSoqlPolymorphicFieldDescriptions().length}/${sobject.polymorphicFields.length})`);
			}
		}, 600);
	}

	/**
	 *  Set titles for the add-ons tabset.
	 */
	private setAddOnsTabsetTitles() {
		this.$app.$timeout(() => {
			const $ctrl = AngularUtils.$getController<UiTabsController>('#objectAddOnsTabset');
			const sobject = DatabaseService.getSObject();
			if ($ctrl) {
				$ctrl.setTabTitle('objectOnBefore', `${this.$app.$translate.translate({ key: 'ON_BEFORE_ADD_ONS' })} (${sobject.beforeAddons?.length || 0})`);
				$ctrl.setTabTitle('objectOnAfter', `${this.$app.$translate.translate({ key: 'ON_AFTER_ADD_ONS' })} (${sobject.afterAddons?.length || 0})`);
				$ctrl.setTabTitle('objectOnBeforeUpdate', `${this.$app.$translate.translate({ key: 'ON_BEFORE_UPDATE_ADD_ONS' })} (${sobject.beforeUpdateAddons?.length || 0})`);
				$ctrl.setTabTitle('objectOnAfterUpdate', `${this.$app.$translate.translate({ key: 'ON_AFTER_UPDATE_ADD_ONS' })} (${sobject.afterUpdateAddons?.length || 0})`);
				$ctrl.setTabTitle('objectOnFlterRecords', `${this.$app.$translate.translate({ key: 'FILTER_RECORDS_ADD_ONS' })} (${sobject.filterRecordsAddons?.length || 0})`);
			}
		}, 600);
	}

	private setupQueryEditor() {

		const sObject = DatabaseService.getSObject();

		this.queryTabsFormSetup = {
			externalId: {
				type: 'autocomplete',
				label: 'External Id Field',
				options: this.getAllSObjectFieldDescriptions().filter(x => x.canBeExternalId).map(x => { return { value: x.name, label: x.name } }).sortBy('label'),
				allowUnlistedInput: true,
				widthOf12: 7,
				helpSearchWord: "EXTERNAL_ID",
				addHelpLinks: true
			},
			operation: {
				type: 'select',
				label: 'Operation',
				options: [{ value: 'Insert', label: 'Insert' },
				{ value: 'Update', label: 'Update' },
				{ value: 'Upsert', label: 'Upsert' },
				{ value: 'Delete', label: 'Delete' },
				{ value: 'DeleteSource', label: 'DeleteSource' },
				{ value: 'DeleteHierarchy', label: 'DeleteHierarchy' },
				{ value: 'HardDelete', label: 'HardDelete' },
				{ value: 'Readonly', label: 'Readonly' }],
				widthOf12: 3,
				helpSearchWord: "OPERATION",
				addHelpLinks: true
			},
			master: { type: 'toggle', label: 'Master', widthOf12: 2, helpSearchWord: "MASTER", addHelpLinks: true },
			where: { type: 'textarea', label: 'Query WHERE clause', widthOf12: 12, helpSearchWord: "WHERE", addHelpLinks: true },
			orderBy: { type: 'input', label: 'Query ORDER BY clause', widthOf12: 4, helpSearchWord: "ORDER_BY", addHelpLinks: true },
			limit: { type: 'number', label: 'Query LIMIT clause', widthOf12: 4, min: 0, helpSearchWord: "LIMIT", addHelpLinks: true },
			offset: { type: 'number', label: 'Query OFFSET clause', widthOf12: 4, min: 0, helpSearchWord: "OFFSET", addHelpLinks: true },
			deleteQueryWhere: { type: 'textarea', label: 'Delete query WHERE clause', widthOf12: 6, helpSearchWord: "DELETE_QUERY", addHelpLinks: true },
			targetRecordsFilter: { type: 'textarea', label: 'Target records filter', widthOf12: 6, helpSearchWord: "TARGET_RECORDS_FILTER", addHelpLinks: true }
		};

		const json = {
			externalId: sObject.externalId,
			master: sObject.master || false,
			operation: sObject.operation || 'Insert',
			where: sObject.where || '',
			orderBy: sObject.orderBy || '',
			limit: sObject.limit || 0,
			offset: sObject.offset || 0,
			deleteQueryWhere: sObject.deleteQueryWhere || '',
			targetRecordsFilter: sObject.targetRecordsFilter || ''
		};
		const $ctrl = AngularUtils.$getController<UiJsonEditorController>('#objectQueryTabForm');
		if ($ctrl) {
			$ctrl.setJson(json);
		}
	}



	private _oldSelectedPolymorphicField: string | undefined = undefined;

	/**
	 * Set the polymorphic fields setup.
	 * Used by the polymorphic fields tab.
	 * @param newItemJson  The new item json.	 
	 */
	private setupPolymorphicFieldsEditor(newItemJson?: any) {

		const selectedPolymorhicField = newItemJson?.name as string;
		if (selectedPolymorhicField && selectedPolymorhicField == this._oldSelectedPolymorphicField) {
			return;
		}
		this._oldSelectedPolymorphicField = selectedPolymorhicField;

		const sobject = DatabaseService.getSObject();
		let referencedSObjects: SObjectDescribe[] = [];

		const $ctrl = AngularUtils.$getController<UiEditFormArrayController>('#objectPolymorphicTabForm');

		if (selectedPolymorhicField) {
			const fieldDescribe = this.selectedSObject?.fieldsMap.get(selectedPolymorhicField);
			if (fieldDescribe) {
				referencedSObjects = fieldDescribe.referenceTo.innerJoin(
					this.getAllSObjectsDescriptions(), (referendeTo, obj) => referendeTo == obj.name, (referenceTo, obj) => obj
				);
			}
			$ctrl.setNewObject({
				name: selectedPolymorhicField,
				objectName: undefined
			});
		} else {
			$ctrl.setNewObject({
				name: undefined,
				objectName: undefined
			});
		}

		this.polymorphicFieldsArraySetup = {
			name: {
				type: 'select',
				options: this.getAllSoqlPolymorphicFieldDescriptions()
					.map(x => {
						return {
							value: x.name,
							label: x.label
						}
					})
			},
			objectName: {
				type: 'select',
				options: sobject.polymorphicFields
					.map(x => {
						return {
							value: x.objectName,
							label: x.objectName
						}
					})
			},
		};

		this.polymorphicFieldsSetup = {
			name: {
				type: 'select',
				label: this.$app.$translate.translate({ key: 'POLYMORPHIC_FIELD' }),
				required: true,
				options: this.getAllSoqlFieldDescriptions()
					.filter(x => x.isPolymorphic)
					.exclude(sobject.polymorphicFields, (field, json) => field.name == json.name)
					.map(x => {
						return {
							value: x.name,
							label: x.label
						}
					}).sortBy('label')
			},
			objectName: {
				type: 'select',
				label: this.$app.$translate.translate({ key: 'REFERENCED_SOBJECT' }),
				required: true,
				options: referencedSObjects
					.map(x => {
						return {
							value: x.name,
							label: x.label
						}
					}).sortBy('label')
			},
		};

		this.polymorphicFieldsJsonArray = sobject.polymorphicFields;
		this.setFieldsTabsetTitles();
	}


	/**
	 *  Set the field mapping setup.
	 * @param setSObjectsList  Indicates whether to set the sobjects list or not.
	 * @returns 
	 */
	private async setupFieldsMappingEditorAsync(setSObjectsList: boolean) {

		const sobject = DatabaseService.getSObject();

		this.targetObjectNotDescribed = false;

		if (global.appGlobal.isOffline) {
			return;
		}

		if (setSObjectsList) {

			const availableTargetSObjects = [...this.$app.orgDescribe.objectsMap.values()]
				.filter(x => x.dataSource == DataSource.target || x.dataSource == DataSource.both);
			const objectsToAdd = availableTargetSObjects.map(x => x.name).includes(sobject.targetObject) ? [] : [{
				value: sobject.targetObject,
				label: sobject.targetObject
			}];

			// Set sObject list
			// Build available target objects list
			this.fieldMappingTargetObjectsListFormSetup = {
				targetObject: {
					type: 'select',
					label: this.$app.$translate.translate({ key: 'TARGET_SOBJECT' }),
					required: true,
					options: availableTargetSObjects
						.map(x => {
							return {
								value: x.name,
								label: x.label
							}
						}).concat(objectsToAdd)
						.sortBy('label')
				},
			};

			// Set the target object
			this.fieldMappingTargetObjectsListJson = {
				targetObject: sobject.targetObject
			};

			// Describe the currently selected sobject if not described yet
			const targesObjectDescription = this.$app.orgDescribe.objectsMap.get(sobject.targetObject);

			if (!targesObjectDescription.isDescribed) {
				const isSuccess = await this.$app.describeWorkspaceSObjectAsync(sobject.targetObject);
				if (!isSuccess) {
					LogService.warn(`Could not describe sobject ${sobject.targetObject} in the target org.`);
					return;
				}
			}

		} else {

			// Set fields for the selected target object
			const targetObjectDescription = this.$app.orgDescribe.objectsMap.get(sobject.targetObject);
			if (!targetObjectDescription.isDescribed) {
				this.targetObjectNotDescribed = true;
				LogService.warn(`Could not setup field mapping since sobject ${sobject.targetObject} is not described in the target org.`);
				return;
			}

			this.$app.$spinner.showSpinner();
			await CommonUtils.delayAsync(200);

			// Source fields
			const availableSourcefields = this.getAllSoqlFieldDescriptions()
				.filter(x => !x.isPolymorphic && !x.isMultiSelect);

			const availableSourceArrayFields = [
				...availableSourcefields,
				...sobject.fieldMapping.filter(x => !!x.sourceField)
					.map(x => {
						return {
							name: x.sourceField,
							label: x.sourceField,
							dataSource: DataSource.unknown
						} as SFieldDescribe;
					})
			].distinct("name");


			// Target fields
			let availableTargetFields = [...targetObjectDescription.fieldsMap.values()]
				.filter(x => x.dataSource == DataSource.target || x.dataSource == DataSource.both
					&& !x.isPolymorphic && !x.isMultiSelect);

			const availableTargetArrayFields = [
				...availableTargetFields,
				...sobject.fieldMapping.filter(x => !!x.targetField)
					.map(x => {
						return {
							name: x.targetField,
							label: x.targetField,
							dataSource: DataSource.unknown
						} as SFieldDescribe;
					})
			].distinct("name");

			availableTargetFields = availableTargetFields.exclude(sobject.fieldMapping, (targetField, mapping) => targetField.name == mapping.targetField);
			if (sobject.targetObject == sobject.name) {
				availableTargetFields = availableTargetFields.exclude(this.getAllSoqlFieldDescriptions(), (targetField, soqlField) => targetField.name == soqlField.name);

			}

			// New item 
			this.fieldMappingSetup = {
				sourceField: {
					type: 'select',
					label: this.$app.$translate.translate({ key: 'SOURCE_FIELD' }),
					required: true,
					options: availableSourcefields
						.exclude(sobject.fieldMapping, (field, json) => field.name == json.sourceField)
						.map(x => {
							return {
								value: x.name,
								label: x.label
							}
						}).sortBy('label')
				},
				targetField: {
					type: 'select',
					label: this.$app.$translate.translate({ key: 'TARGET_FIELD' }),
					required: true,
					options: availableTargetFields.map(x => {
						return {
							value: x.name,
							label: x.label
						}
					}).sortBy('label')
				},
			};

			// The array of selected items
			this.fieldMappingArraySetup = {
				sourceField: {
					type: 'select',
					options: availableSourceArrayFields
						.map(x => {
							return {
								value: x.name,
								label: x.label
							}
						})
				},
				targetField: {
					type: 'select',
					options: availableTargetArrayFields.map(x => {
						return {
							value: x.name,
							label: x.label
						}
					})
				},
			};

			this.fieldMappingJsonArray = sobject.fieldMapping.filter(x => !!x.targetField);

			this.$app.$timeout(() => {
				this.$app.$spinner.hideSpinner();
			}, 100);

		}

	}

	/**
	 * Setups editor for data anonymization.
	 */
	private setupDataAnonymizationEditor() {

		const sobject = DatabaseService.getSObject();
		const mockedFieldOptions = sobject.mockFields.map(x => {
			return {
				value: x.name,
				label: x.name
			}
		});

		this.dataAnonymizationSetup = {
			name: {
				type: 'select',
				label: this.$app.$translate.translate({ key: 'SOURCE_FIELD' }),
				required: true,
				options: this.getAllSoqlFieldDescriptions()
					.exclude(mockedFieldOptions, (field, mocked) => field.name == mocked.value)
					.filter(x => !x.readonly && !x.isMultiSelect)
					.map(x => {
						return {
							value: x.name,
							label: x.label
						}
					}).sortBy('label')
			},
			pattern: {
				type: 'select',
				label: this.$app.$translate.translate({ key: 'ANONYMIZATION_PATTERN' }),
				required: true,
				options: SfdmuUtils.getFieldMockPatternOptions(sobject)
			},
			excludedRegex: {
				type: 'input',
				label: this.$app.$translate.translate({ key: 'EXCLUDED_REGEX' }),
				required: false
			},
			includedRegex: {
				type: 'input',
				label: this.$app.$translate.translate({ key: 'INCLUDED_REGEX' }),
				required: false
			},
		};

		this.dataAnonymizationArraySetup = {
			name: {
				type: 'select',
				options: this.getAllSoqlFieldDescriptions()
					.filter(x => !x.readonly && !x.isMultiSelect)
					.map(x => {
						return {
							value: x.name,
							label: x.label
						}
					}).sortBy('label')
			},
			pattern: {
				type: 'select',
				options: SfdmuUtils.getFieldMockPatternOptions(sobject)
					.concat(mockedFieldOptions).distinct("value").sortBy('label')
			},
			excludedRegex: {
				type: 'input'
			},
			includedRegex: {
				type: 'input'
			},
		};

		this.dataAnonymizationJsonArray = sobject.mockFields;
	}

	/**
	 *  Setups editor for field mapping.
	 */
	private setupAddOnJsonEditors() {
		const sObject = DatabaseService.getSObject();
		this.addOnFormData = Object.keys(sObject)
			.filter(property => property.endsWith('Addons'))
			.reduce((acc: any, property: string) => {
				acc[property] = JSON.stringify(sObject[property] || [], null, 2);
				return acc;
			}, {})
		this.resetAddOnTab();
		this.isAddOnsChanged = false;
	}


	private setupAddOnVisualEditor(componentId: string) {

		const addOnEvent = componentId
		const availableModules: IOption[] = [];
		const scriptObject = DatabaseService.getSObject();

		// Available modules
		availableModules.push(...availableCoreAddOnModules.object[addOnEvent]);
		const moduleDeclarations = scriptObject[addOnEvent] || [];


		// Hidden messages
		if (!availableModules.length) {
			if (moduleDeclarations.length) {
				this.addOnFormHiddenNew = true;
				this.addOnFormHidden = false;
			} else {
				this.addOnFormHidden = true;
			}
		} else {
			this.addOnFormHiddenNew = false;
			this.addOnFormHidden = false;
		}

		// Form setups
		const availableAddOnOptions = availableModules.map(option => {
			return {
				value: option.value,
				label: option.label
			}
		});

		this.addOnFormArraySetup = {
			module: {
				type: 'input'
			},
			description: {
				type: 'input'
			},
		};

		this.addOnFormSetup = {
			module: {
				type: 'select',
				required: true,
				label: this.$app.$translate.translate({ key: 'MODULE' }),
				options: availableAddOnOptions
			},
			description: {
				type: 'input',
				required: false,
				label: this.$app.$translate.translate({ key: 'DESCRIPTION' })
			},
		}

		// Array assignment
		this.addOnFormJsonArray = moduleDeclarations;

		// Setup new object
		this.addOnFormNewObject = addOnsDefaultFormConfig[addOnEvent];


	}

	/**
	 * Setups editor for field mapping.
	 */
	private setupObjectSettingsEditor() {

		const sobject = DatabaseService.getSObject();

		this.objectSettingsSetup = {
			// Row 1
			bulkApiV1BatchSize: {
				type: 'number',
				label: 'bulkApiV1BatchSize',
				required: false,
				min: 1,
				max: 100000,
				widthOf12: 3,
				helpSearchWord: "BULK_API_V1_BATCH_SIZE",
				addHelpLinks: true
			},
			restApiBatchSize: {
				type: 'number',
				label: 'restApiBatchSize',
				required: false,
				min: 1,
				max: 100000,
				widthOf12: 3,
				helpSearchWord: "REST_API_BATCH_SIZE",
				addHelpLinks: true
			},
			parallelBulkJobs: {
				type: 'number',
				label: 'parallelBulkJobs',
				required: false,
				min: 1,
				max: 100,
				widthOf12: 3,
				helpSearchWord: "PARALLEL_BULK_JOBS",
				addHelpLinks: true
			},
			parallelRestJobs: {
				type: 'number',
				label: 'parallelRestJobs',
				required: false,
				min: 1,
				max: 100,
				widthOf12: 3,
				helpSearchWord: "PARALLEL_REST_JOBS",
				addHelpLinks: true
			},

			// Row 2
			useQueryAll: {
				type: 'toggle',
				label: 'useQueryAll',
				required: false,
				widthOf12: 3,
				helpSearchWord: "USE_QUERY_ALL",
				addHelpLinks: true
			},
			queryAllTarget: {
				type: 'toggle',
				label: 'queryAllTarget',
				required: false,
				widthOf12: 3,
				helpSearchWord: "QUERY_ALL_TARGET",
				addHelpLinks: true
			},
			skipExistingRecords: {
				type: 'toggle',
				label: 'skipExistingRecords',
				required: false,
				widthOf12: 3,
				helpSearchWord: "SKIP_EXISTING_RECORDS",
				addHelpLinks: true
			},
			useSourceCSVFile: {
				type: 'toggle',
				label: 'useSourceCSVFile',
				required: false,
				widthOf12: 3,
				helpSearchWord: "USE_SOURCE_CSV_FILE",
				addHelpLinks: true
			},

			// Row 3
			skipRecordsComparison: {
				type: 'toggle',
				label: 'skipRecordsComparison',
				required: false,
				widthOf12: 12,
				helpSearchWord: "SKIP_RECORDS_COMPARISON",
				addHelpLinks: true
			},

			// Row 4
			deleteOldData: {
				type: 'toggle',
				label: 'deleteOldData',
				required: false,
				widthOf12: 3,
				helpSearchWord: "DELETE_OLD_DATA",
				addHelpLinks: true
			},
			deleteFromSource: {
				type: 'toggle',
				label: 'deleteFromSource',
				required: false,
				widthOf12: 3,
				helpSearchWord: "DELETE_FROM_SOURCE",
				addHelpLinks: true
			},
			deleteByHierarchy: {
				type: 'toggle',
				label: 'deleteByHierarchy',
				required: false,
				widthOf12: 3,
				helpSearchWord: "DELETE_BY_HIERARCHY",
				addHelpLinks: true
			},
			hardDelete: {
				type: 'toggle',
				label: 'hardDelete',
				required: false,
				widthOf12: 3,
				helpSearchWord: "HARD_DELETE",
				addHelpLinks: true
			},

			// Row 5
			useCSVValuesMapping: {
				type: 'toggle',
				label: 'useCSVValuesMapping',
				required: false,
				widthOf12: 3,
				helpSearchWord: "USE_CSV_VALUES_MAPPING",
				addHelpLinks: true
			},
			useValuesMapping: {
				type: 'toggle',
				label: 'useValuesMapping',
				required: false,
				widthOf12: 3,
				helpSearchWord: "USE_VALUES_MAPPING",
				addHelpLinks: true
			},
			useFieldMapping: {
				type: 'toggle',
				label: 'useFieldMapping',
				required: false,
				widthOf12: 3,
				helpSearchWord: "USE_FIELD_MAPPING",
				addHelpLinks: true
			},
			updateWithMockData: {
				type: 'toggle',
				label: 'updateWithMockData',
				required: false,
				widthOf12: 3,
				helpSearchWord: "UPDATE_WITH_MOCK_DATA",
				addHelpLinks: true
			}
		};

		this.objectSettingsJson = {

			// API_CONFIGURATION
			// Row 1
			bulkApiV1BatchSize: sobject.bulkApiV1BatchSize,
			restApiBatchSize: sobject.restApiBatchSize,
			parallelBulkJobs: sobject.parallelBulkJobs,
			parallelRestJobs: sobject.parallelRestJobs,

			// RECORD_PROCESSING_MODE
			// Row 2
			useQueryAll: sobject.useQueryAll,
			queryAllTarget: sobject.queryAllTarget,
			skipExistingRecords: sobject.skipExistingRecords,
			useSourceCSVFile: sobject.useSourceCSVFile,
			// Row 3
			skipRecordsComparison: sobject.skipRecordsComparison,

			// DATA_DELETION_FLAGS
			// Row 4
			deleteOldData: sobject.deleteOldData,
			deleteFromSource: sobject.deleteFromSource,
			deleteByHierarchy: sobject.deleteByHierarchy,
			hardDelete: sobject.hardDelete,

			// DATA_TRANSFORMATION
			// Row 5
			useCSVValuesMapping: sobject.useCSVValuesMapping,
			useValuesMapping: sobject.useValuesMapping,
			useFieldMapping: sobject.useFieldMapping,
			updateWithMockData: sobject.updateWithMockData
		};


		this.objectSettingsTitles = [
			// row 1
			this.$app.$translate.translate({ key: 'API_SETTINGS' }),
			// row 2
			this.$app.$translate.translate({ key: 'RECORD_PROCESSING_MODE' }),
			// row 3
			'',
			// row 4
			this.$app.$translate.translate({ key: 'DATA_DELETION_FLAGS' }),
			// row 5
			this.$app.$translate.translate({ key: 'DATA_TRANSFORMATION' }),
		];

	}

	private resetAddOnTab(addOnEvent?: string) {
		if (addOnEvent) {
			this.addOnSelectedTabs[addOnEvent] = 'addOnEditJson';
			return;
		}
		Object.keys(this.addOnSelectedTabs).forEach(addOnEvent => {
			this.addOnSelectedTabs[addOnEvent] = 'addOnEditJson';
		});
	}


	// Event handlers --------------------------------------------------------
	/**
	 *  Handle the fields selected event.
	 *  Handles selecting of the main sobject fields, excluded fields and excluded from update fields.
	 * @param args  The event arguments.
	 */
	async handleFieldsSelected(args: IActionEventArgParam<IOption>) {
		if (this._supressSelectEvent) return;

		const sObject = DatabaseService.getSObject();

		switch (args.componentId) {
			case 'objectFieldsSelector': {
				sObject.fields = args.args.map(x => x.value);
				sObject.fieldMapping = sObject.fieldMapping.filter(x => x.targetObject || sObject.fields.includes(x.sourceField));
				sObject.mockFields = sObject.mockFields.filter(x => sObject.fields.includes(x.name));
				SfdmuUtils.setSOQLFields(sObject, sObject.fields, true);
				LogService.info(`Fields: ${sObject.fields.length} were selected for sobject ${sObject.name}`);
			} break;
			case 'excludedFieldsSelector': {
				sObject.excludedFields = args.args.map(x => x.value);
				LogService.info(`Fields: ${sObject.excludedFields.length} were excluded for sobject ${sObject.name}`);
			} break;
			case 'excludedFromUpdateFieldsSelector': {
				sObject.excludedFromUpdateFields = args.args.map(x => x.value);
				LogService.info(`Fields: ${sObject.excludedFromUpdateFields.length} were excluded from update for sobject ${sObject.name}`);
			} break;
		}

		await this.makeFullQueryAsync(false);
		this.refreshObjectList();

		// Update the config
		const config = DatabaseService.getConfig();
		const ws = DatabaseService.getWorkspace();
		DatabaseService.updateConfig(ws.id, config);
	}

	/**
	 *  Handle the change of target object in the field mapping tab.
	 * @param args  The event arguments.
	 */
	async handleFieldMappingTargetObjectChange(args: IActionEventArgParam<any>) {
		const sobject = DatabaseService.getSObject();
		sobject.fieldMapping = args.args[0].targetObject ? [
			{
				targetObject: args.args[0].targetObject
			} as ScriptMappingItem
		] : [];

		const ws = DatabaseService.getWorkspace();
		const config = DatabaseService.getConfig();
		DatabaseService.updateConfig(ws.id, config);


		LogService.info(`Target object ${args.args[0].targetObject} was selected for sobject ${sobject.name}`);

		await this.setupFieldsMappingEditorAsync(true);
		await this.setupFieldsMappingEditorAsync(false);

		this.refreshObjectList();

	}


	/**
	 *  Handle the adding or removing the item from field mapping array.
	 * @param args  The event arguments.
	 */
	async handleFieldMappingChange(args: IActionEventArgParam<any>) {
		const sobject = DatabaseService.getSObject();
		sobject.fieldMapping = args.args[0].length ? [
			{
				targetObject: sobject.targetObject
			} as ScriptMappingItem
		].concat(args.args[0]) : [];

		const ws = DatabaseService.getWorkspace();
		const config = DatabaseService.getConfig();
		DatabaseService.updateConfig(ws.id, config);

		LogService.info(`Field mapping was changed for sobject ${sobject.name}`);

		await this.setupFieldsMappingEditorAsync(true);
		await this.setupFieldsMappingEditorAsync(false);

		this.refreshObjectList();

	}

	/**
	 *  Handle the adding or removing the item from mock fields array.
	 * @param args  The event arguments.
	 */
	handleDataAnonymizationChange(args: IActionEventArgParam<any>) {
		const sobject = DatabaseService.getSObject();
		sobject.mockFields = args.args[0];

		const ws = DatabaseService.getWorkspace();
		const config = DatabaseService.getConfig();
		DatabaseService.updateConfig(ws.id, config);

		LogService.info(`Data anonymization was changed for sobject ${sobject.name}`);

		this.setupDataAnonymizationEditor();

		this.refreshObjectList();
	}


	/**
	 *  Switches the tab. 
	 * 	Each tabs holds a set of controls to setup some aspect of the object.
	 * @param args The event arguments.
	 */
	handleTabChange(args: IActionEventArgParam<ITabItem>) {

		const tab = args.args[0];
		const componentId = args.componentId;
		const addOnEvent = componentId;

		if (componentId == 'objectAddOnsTabset') {
			this.resetAddOnTab();
			AngularUtils.$apply(this.$scope);
			return;
		}

		if (tab.tabId == 'addOnVisualEditor') {
			if (this.isAddOnsChanged) {
				const result = DialogService.showPromptDialog({
					titleKey: "DIALOG.ADD_ON_VISUAL_EDITOR.TITLE",
					messageKey: "DIALOG.ADD_ON_VISUAL_EDITOR.MESSAGE_WHEN_SWITCH_TO_VISUAL_TAB_WITH_UNSAVED_CHANGES",
					dialogType: DialogType.warning
				});
				if (!result) {
					return true; // Cancel tab switch
				} else {
					this.handleAddOnsSave();
				}
			}
			this.setupAddOnVisualEditor(addOnEvent);
			AngularUtils.$apply(this.$scope);
			return;
		}

		AngularUtils.$apply(this.$scope, async () => {

			switch (tab.tabId) {

				case 'addOns': {
					this.addOnsSelectedTabId = "objectOnBefore";
					this.setupAddOnJsonEditors();
					this.setAddOnsTabsetTitles();
				} break;
				
				case 'fields':
					// NOOP: This tab is default and proceed in the setup method
					break;

				case 'query': {
					this.setupQueryEditor();
				} break;

				case 'testQuery': {
					this.selectedQueryTestTabIndex = 0;
					await this.makeFullQueryAsync(false);
					this.refreshObjectList();
				} break;

				case 'polymorphicFields': {
					this.setupPolymorphicFieldsEditor();
				} break;

				case 'fieldsMapping': {
					await this.setupFieldsMappingEditorAsync(true);
					await this.setupFieldsMappingEditorAsync(false);
				} break;

				case 'dataAnonymization': {
					this.setupDataAnonymizationEditor();
				} break;

				case 'objectSettings': {
					this.setupObjectSettingsEditor();
				} break;


			}
		});
	}

	/**
	 *  Handle the object manager form change event.
	 * 	Updates the sobject properties.
	 * @param args  The event arguments.
	 */
	async handleObjectManagerFormChange(args: IActionEventArgParam<any>) {

		const json = args.args[0];
		const sobject = DatabaseService.getSObject();
		const config = DatabaseService.getConfig();
		const ws = DatabaseService.getWorkspace();

		Object.assign(sobject, json);
		sobject.query = SfdmuUtils.createQueryString(sobject, sobject.fields, true).query;

		if (this.oldExternalId != sobject.externalId) {
			await this.makeFullQueryAsync(false);
		}
		this.oldExternalId = sobject.externalId;

		this.refreshObjectList();

		DatabaseService.updateConfig(ws.id, config);
		const propsToUpdate = Object.keys(json);
		LogService.info(`Object ${sobject.name} properties updated: ${propsToUpdate.take(3).join(', ')}, ...`);
	}


	// Add-On Visual Editor ----------------------------
	/**
	 *  Handle the add-ons visual editor delete event.
	 */
	handleAddOnsEditorDelete() {
		const allowDelete = DialogService.showPromptDialog({
			titleKey: "DIALOG.ADD_ON_VISUAL_EDITOR.TITLE",
			messageKey: "DIALOG.ADD_ON_VISUAL_EDITOR.MESSAGE_WHEN_DELETE",
			dialogType: DialogType.warning
		});

		return !allowDelete;
	}

	/**
	 *  Handle the add-ons visual editor change event.
	 * @param args  The event arguments.
	 */
	handleAddOnsEditorChange(args: IActionEventArgParam<any>) {
		const addOnEvent = args.componentId.replace('objectAddOnsForm-', '');
		this.addOnFormData[addOnEvent] = JSON.stringify(args.args[0], null, 2);
		const sObject = DatabaseService.getSObject();
		LogService.info(`Action '${args.action}' performed for Add-On configuration of the '${addOnEvent}' event for sObject '${sObject.name}'.`);
		this.handleAddOnsSave(undefined, false);
	}

	/**
	 * Handle the add-ons visual editor new object change event.
	 * @param args  The event arguments.
	 */
	handleAddOnsEditorAdd(args: IActionEventArgParam<any>) {
		const module = args.args[0].module;
		Object.assign(args.args[0], addOnsDefaultFormConfig[module]);
	}

	/**
	 *  Handle the add-ons visual editor edit event.
	 * @param args  The event arguments.
	 */
	async handleAddOnsEditorShow(args: IActionEventArgParam<any>): Promise<IEditFormResult> {
		const addOnEvent = args.componentId.replace('objectAddOnsForm-', '');
		const module = args.args[0].module;
		let moduleConfig = module;
		// Exceptional modules
		switch (module) {
			case "core:RecordsFilter":
				moduleConfig = args.args[0]?.args?.filterType || module;
				break;
		}
		const json = args.args[0];
		const jsonSchema = CommonUtils.deepClone(addOnsJsonSchemaConfig[moduleConfig]);
		jsonSchema.title = `${module}${moduleConfig == module ? '' : ` (${moduleConfig})`} ${jsonSchema.title}`.trim();
		const sObject = DatabaseService.getSObject();
		LogService.info(`The Visual Add-On Editor was activated for sObject '${sObject.name}', event '${addOnEvent}', and module '${module}'.`);
		const result = await this.$jsonEditModal.editJsonAsync(json, jsonSchema, null, this.$app.$translate.translate({
			key: 'FIX_ERRORS_BEFORE_SAVING_CONFIGURATION'
		}));
		return {
			data: result.data,
			result: result.result
		};
	}

	// --- ----------------------------


	/**
	 *  Handle the add-ons form change event.
	 */
	handleAddOnsChange() {
		AngularUtils.$apply(this.$scope, () => {
			this.isAddOnsChanged = true;
		});
	}

	/**
	 *  Handle the save add-ons button click.
	 * @param args  The event arguments.
	 */
	handleAddOnsSave(args?: IActionEventArgParam<void>, showToastSuccess = true) {
		const sObject = DatabaseService.getSObject();
		const config = DatabaseService.getConfig();
		const ws = DatabaseService.getWorkspace();
		let isIncorrectJson = false;
		AngularUtils.$apply(this.$scope, () => {
			Object.keys(this.addOnFormData).forEach(key => {
				try {
					sObject[key] = this.addOnFormData[key] ? JSON.parse(this.addOnFormData[key]) : [];
				} catch {
					isIncorrectJson = true;
				}
				this.addOnFormData[key] = JSON.stringify(sObject[key] || [], null, 2);
			});
			this.isAddOnsChanged = false;
		});
		this.setAddOnsTabsetTitles();
		DatabaseService.updateConfig(ws.id, config);
		if (!isIncorrectJson && showToastSuccess) {
			ToastService.showSuccess();
			LogService.info(`Add-ons for sobject ${sObject.name} updated.`);
		} else if (isIncorrectJson) {
			ToastService.showWarn(this.$app.$translate.translate({ key: 'SAVED_INCORRECT_ADDON_JSON' }));
			LogService.warn(`Some Add-ons for sobject ${sObject.name} were not saved due to incorrect JSON.`);
		}
	}

	/**
	 *  Handle the restore add-ons button click.
	 */
	handleAddOnsRestore() {
		const sObject = DatabaseService.getSObject();
		AngularUtils.$apply(this.$scope, () => {
			this.setupAddOnJsonEditors();
			ToastService.showSuccess();
			LogService.info(`Add-ons for sobject ${sObject.name} restored.`);
		});
	}

	/**
	 * Handle the run query string test button click.
	 */
	async handleRunQueryStringTest() {
		const result = await this.makeFullQueryAsync(true);
		if (!result) {
			ToastService.showError(this.$app.$translate.translate({ key: 'QUERY_TEST_ERROR' }));
		} else {
			ToastService.showSuccess(this.$app.$translate.translate({ key: 'QUERY_TEST_SUCCESS' }));
		}
	}

	/**
	 * Handle the copy query string to clipboard button click.
	 */
	async handleCopyQueryStringToClipboard() {
		if (await AngularUtils.copyTextToClipboardAsync(this.fullSoqlQuery)) {
			LogService.info(`Query string copied to clipboard.`);
			ToastService.showSuccess(this.$app.$translate.translate({ key: 'COPIED' }));
		} else {
			LogService.info(`Unable to copy query string to clipboard.`);
			ToastService.showError(this.$app.$translate.translate({ key: 'COPIED_ERROR' }));
		}
	}

	/**
	 *  Handle the polymorphic fields change event.
	 * @param args  The event arguments.
	 */
	handlePolymorphicFieldsChange(args: IActionEventArgParam<PolymorphicField[]>) {

		const sobject = DatabaseService.getSObject();
		const config = DatabaseService.getConfig();
		const ws = DatabaseService.getWorkspace();

		sobject.polymorphicFields = args.args[0];

		this.setupPolymorphicFieldsEditor();
		this.refreshObjectList();

		DatabaseService.updateConfig(ws.id, config);
		LogService.info(`Polymorphic fields for sobject ${sobject.name} updated.`);
	}

	/**
	 * Handle the polymorphic fields new object change event.
	 * @param args  The event arguments.
	 */
	handlePolymorphicFieldsNewObjectChange(args: IActionEventArgParam<any>) {
		this.setupPolymorphicFieldsEditor(args.args[0]);
	}


	// ------------------------------------------------------------------------
	// Private methods --------------------------------------------------------
	// ------------------------------------------------------------------------
	/**
	 *  Makes a full query string.
	 * @param sObject  The sobject.
	 * @param query  The query.
	 * @returns 
	 */
	private buildTargetQueryString(sObject: ScriptObject, query: string): string {
		if (!this.queryTestUseSourceConnection && sObject.hasFieldMapping) {
			for (const item of sObject.fieldMapping) {
				if (item.targetObject) {
					query = query.replace(sObject.name, item.targetObject);
				}
				if (item.sourceField && item.targetField) {
					query = query.replace(item.sourceField, item.targetField);
				}
			}
		}
		return query;
	}

}
