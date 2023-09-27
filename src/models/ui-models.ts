import { SObjectDescribe } from ".";
import { BsButtonStyle, BsSize, DataSource, FaIcon } from "../common";


/** Interface for defining an icon. */
export interface IIcon {
    /** The name of the icon. */
    icon?: FaIcon;
    /** Popover content. */
    popover?: string;
    /** The class of the icon. */
    iconClass?: string
    /** Custom css class for the icon tooltip. */
    iconTooltipCustomClass?: string;
}

/** Base interface for all source items. */
export interface ISourceItemBase {
    /** The id of the item. */
    id?: string;
    /** The action of the item. */
    action?: string;
    /** Whether the item is disabled. */
    disabled?: boolean;
    /** The icons of the item. */
    icons?: IIcon[];
    /** Popover content. */
    popover?: string;
}


/** Menu item interface. */
export interface IMenuItem extends ISourceItemBase {
    /** The title of the item. */
    title?: string;
    /** The children of the item. */
    children?: IMenuItem[];
    /** The type of the item. */
    itemType?: 'item' | 'divider';
}


export interface ITabItem extends ISourceItemBase, angular.IScope {
    /** The title of the item. */
    title?: string;
    /** The icon of the item. */
    icon?: FaIcon;
    /** Whether the item is active. */
    active?: boolean;
    /** The tab id of the item. */
    tabId?: string;
}

/** 
 * Option interface.
 * Used for option items in various components.
 */
export interface IOption extends ISourceItemBase {
    /** The name of the option. */
    name?: string;
    /** The value of the option. */
    value: string;
    /** The data of the option. */
    data?: any;
    /** The label of the option. */
    label: string;
    /** Whether the option is selected. */
    selected?: boolean;
    /** Whether the option is disabled. */
    disabled?: boolean;
    /** Whether the option is inactive. */
    inactive?: boolean;
    /** The icons of the option. */
    icons?: IIcon[];
    /** The group of the option. */
    group?: string;
    /** Error message of the option. */
    errorMessage?: string;
    /** Whether the option is active. */
    active?: boolean;
    /** Whether the option has errors. */
    hasErrors?: boolean;
}

/**
 * Represents optional settings for an SObject.
 * @interface
 * @extends IOption
 */
export interface ISObjectOption extends IOption {
    /** Data associated with the SObject option */
    data?: SObjectOptionData;
}

/**
 * Contains data and settings for an SObject option.
 * @class
 */
export class SObjectOptionData {
    /** Indicates whether the object is a master or not */
    isMaster: boolean;
    /** Indicates if the object has a mapping */
    hasMapping: boolean;
    /** Contains any errors associated with the object */
    objectError: string;
    /** Contains any field-specific errors */
    fieldErrors: string;
    /** List of fields missing in the source */
    missingFieldsInSource: string[] = [];
    /** List of fields missing in the target */
    missingFieldsInTarget: string[] = [];
    /** Indicates if there are polymorphic fields without definitions */
    polymorphicFieldsWithoutDefinitions: boolean;
    /** Indicates if polymorphic fields are missing a reference */
    polymorphicFieldsMissingReference: boolean;
    /** Contains errors related to object settings */
    settingsErrors: string;
    /** List of fields that have anonymization but no field descriptions */
    anonymizationWithoutFieldDescriptions: string[] = [];
    /** Indicates if there's a mapping without an SObject in the target */
    mappingWithoutSObjectInTarget: boolean;
    /** List of mapped fields that are missing in the target */
    mappedFieldsMissingInTarget: string[] = [];

    /**
     * Constructs an instance of SObjectOptionData.
     * @param {SObjectDescribe} [describe] - The description of the SObject.
     * @param {any} [translate={}] - Object containing translation information.
     */
    constructor(describe?: SObjectDescribe, translate: any = {}) {
        this.objectError = describe?.dataSource === DataSource.source ? translate.missingInTarget
            : describe?.dataSource === DataSource.target ? translate.missingInSource
                : describe == undefined || describe.dataSource == DataSource.unknown ? translate.missingInBoth : null;
    }
}



/** 
 * Interface for defining a form field.
 */
export interface ISetupFormOption {
    /** The type of the field. */
    type: 'input' | 'textarea' | 'select' | 'autocomplete' | 'toggle' | 'button' | 'divider' | 'number';
    /** Options for the field. Used if the field has a list of options. */
    options?: IOption[];
    /** whether the field is required. */
    required?: boolean;
    /** Indicates valid or invalid state of the field. */
    validationStatus?: boolean | null;
    /** The label of the field. */
    label?: string;
    /** Popover content if popover icon is present. */
    popover?: string;
    /** Whether the field is disabled. */
    disabled?: boolean;
    /** The style of the button. */
    buttonStyle?: BsButtonStyle;
    /** The size of the button. */
    buttonSize?: BsSize;
    /** The icon of the field. */
    icon?: FaIcon;
    /**  Action of the field. */
    action?: string;
    /** Placeholder text for the field. */
    placeholder?: string;
    /** The class of the field. */
    formClass?: string;
    /** Determines whether the user can enter a value that is not in the list of options */
    allowUnlistedInput?: boolean;
    /** Whether this element is single in row. */
    singleElementInRow?: boolean;
    /** Determine the percentage of the width of the element considering 12 columns max per row. */
    widthOf12?: number;
    /* Minimum value for number type. */
    min?: number;
    /* Maximum value for number type. */
    max?: number;
    /* Data for the field. */
    data?: any;
    /* The keyword to search in the knowledge base. */
    helpSearchWord?: string;
    /** Whether to add help links to the field. */
    addHelpLinks?: boolean;
}

/**
 * Interface for defining the form controller.
 */
export interface IFormController {
    /** Method to validate the form. */
    validate(): boolean;
    /** Method to reset the form validation. */
    resetValidation(): void;
}

/**
 * Interface for defining the alert scope.
 * Used to setup the alert component.
 */
export interface IAlert {
    /** The message of the alert. */
    message: string;
    /** The type of the alert. */
    type?: 'success' | 'info' | 'warning' | 'danger' | 'primary';
    /** Tooltip content for the icon. */
    iconTooltip?: string;

}





