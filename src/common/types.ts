/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 * For full license text, see the LICENSE.md file in the repo root or https://www.apache.org/licenses/LICENSE-2.0
 */
import { DialogButton, DialogType } from ".";
import { IActionEventArgs, IOption, ISetupFormOption } from "../models";

// Object Definition Types --------------------------------------------------------
export type ClassType<T> = new (...args: any[]) => T;

export type GenericConstructor<T> = { new(...args: any[]): T };

export type Replacement = {
  from: string;
  to: string;
  firstOnly?: boolean;
  toRegex?: RegExp;
};

// Event Types -------------------------------------------------------------------
export type ActionEvent<T> = (args: IActionEventArgs<T>) => any;

export type EditDialogArgs = {
  dialogType: 'inputbox' | 'selectbox' | 'multiselect',
  promptMessage: string,
  title?: string,
  selectBoxOptions?: IOption[],
  isRequired?: boolean,
  invalidMessage?: string,
  defaultValue?: string | string[]
}


// UI Types ------------------------------------------------------------------
export type PromptDialogArgs = {
  messageKey?: string,
  titleKey?: string,
  yesButton?: DialogButton,
  noButton?: DialogButton,
  cancelButton?: DialogButton,
  dialogType?: DialogType,
  params?: any
}

export type SetupFormOptions = {
  [key: string]: ISetupFormOption
}




