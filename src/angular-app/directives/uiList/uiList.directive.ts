import angular, { IScope, ITimeoutService } from "angular";
import { ActionEvent, CONSTANTS, FaIcon } from "../../../common";
import { IActionEventArgParam, IIcon, IOption } from "../../../models";
import { AngularUtils } from "../../../utils";
import { IBroadcastService } from "../../services";


function uiListDirective($timeout: ITimeoutService): angular.IDirective {
	return {
		restrict: 'E',
		template: `
			<div>

				<!-- Label -->
				<label ng-if="$ctrl.label" class="form-label fw-bold">
					{{ $ctrl.getLabel() }}
				</label>
				
				<!-- Horizontal line -->
				<hr class="p-0 m-0 mb-2" />

				<div ng-if="$ctrl.source.length > 0" class="d-flex flex-wrap gx-md">
					
					<!-- Select all and deselect all buttons -->
					<div class="d-flex me-3">
						<button tooltip="{{ 'SELECT_ALL' | translate }}" class="btn btn-link p-0 me-1" ng-click="$ctrl.selectAll()"><i class="far fa-check-square me-1"></i></button>
						<button tooltip="{{ 'DESELECT_ALL' | translate }}" class="btn btn-link p-0 me-1" ng-click="$ctrl.deselectAll()"><i class="far fa-square me-1"></i></button>
						<button tooltip="{{ 'INVERSE_SELECTION' | translate }}" class="btn btn-link p-0" ng-click="$ctrl.inverseSelection()"><i class="fas fa-exchange-alt"></i></button>
					</div>

					<!-- Select box for groups -->					
					<select class="form-control form-control-width" ng-model="$ctrl.selectedGroup">
						<option value="">{{ 'ALL_PLACEHOLDER' | translate }}</option>
						<option ng-repeat="item in $ctrl.source | unique: 'group'" ng-value="item.group">
							{{ item.group }}
						</option>
					</select>

					<!-- Search input box -->				
					<input 
						class="form-control form-control-width-2" 
						type="search" 
						ng-model="$ctrl.searchLabel" 
						ng-model-options="{ debounce: ${CONSTANTS.INPUT_DEBOUNCE_DELAY} }" 
						placeholder="{{ 'SEARCH_PLACEHOLDER' | translate }}" />

				</div>


				<!-- List items -->
				<div class="mb-1 mt-2" style="max-height: {{ $ctrl.maxHeight }}; min-height: {{ $ctrl.minHeight }}; overflow-y: auto;">

					<!-- List group -->
					<ul class="list-group">

						<!-- List item -->
						<li class="list-group-item" ng-repeat="item in $ctrl.getFilteredItems($ctrl.source)"
								ng-style="{opacity: item.disabled || item.inactive ? 0.6 : 1}"
								ng-class="{ 'bg-primary': item.active }">
							
							<!--Select checkbox-->
							<input class="me-2" type="checkbox" ng-model="item.selected" ng-disabled="item.disabled" />

							<!--Icons-->
							<div style="min-width:75px" class="d-inline-block">
								<i ng-repeat="icon in item.icons" class="me-2 {{ icon.icon }} {{ icon.iconClass }}" tooltip="{{ icon.popover }}" tooltip-custom-class="{{ icon.iconTooltipCustomClass }}"></i>
							</div>

							<!--Label-->
							<div class="d-inline-block">
								<div tooltip="{{ item.popover || item.label }}" ng-bind-html="item.label"></div>							
							</div>

							<!--Select button-->
							<button class="btn btn-sm float-end" 
									ng-class="{ 'btn-primary': item.active, 'btn-outline-primary': !item.active }"
									ng-click="$ctrl.handleActivate(item)" 
									tooltip="{{ 'SELECT_THIS_SOBJECT' | translate }}">
								>
							</button>

						</li>
					</ul>
				</div>

			</div>
		`,

		scope: {
			source: '=',
			selected: '=',
			maxHeight: '@',
			minHeight: '@',
			label: '@',
			onSelect: '&',
			onChange: '&'
		},

		controller: UiListController,
		controllerAs: '$ctrl',
		bindToController: true,

		link: ($scope: angular.IScope, $element: angular.IAugmentedJQuery, $attrs: angular.IAttributes, $ctrl: UiListController) => {

			$ctrl.id = AngularUtils.setElementId($scope, $attrs);

			$ctrl.maxHeight ||= '400px';
			$ctrl.minHeight ||= '400px';

			const setupSource = () => {
				$ctrl.source.forEach((item: IOption) => {
					item.selected = $ctrl.selected.includes(item.value);
					item.icons ||= [];
					item.icons = item.icons.map((icon: IIcon) => {
						icon.icon = FaIcon[icon.icon] || icon.icon || '';
						icon.iconClass = icon.iconClass || (icon.icon.includes('exclamation') ? 'text-warning'
							: icon.icon.includes('check') ? 'text-success'
								: 'text-primary');
						return icon;
					});
					if (item.errorMessage) {
						if (!item.icons.some((icon: IIcon) => icon.icon.includes('exclamation'))) {
							item.icons.push({
								icon: FaIcon.exclamationTriangle,
								iconClass: 'text-warning',
								popover: item.errorMessage
							});
						}
					}
				});

				$timeout(() => {
					const activeItem = $ctrl.source.find((item: IOption) => item.active);
					if (activeItem) {
						$ctrl.handleActivate(activeItem);
					}
				}, 500);

			};

			$scope.$watchCollection(() => $ctrl.source, (newVal: IOption[]) => {
				if (newVal) {
					setupSource();
				}
			});

			let oldValues: string[] = [];
			$scope.$watch(() => $ctrl.source, (newVal: IOption[]) => {
				if (newVal) {
					const selected = $ctrl.source.filter((item: IOption) => item.selected).map((item: IOption) => item.value);
					if (oldValues.join() !== selected.join()) {
						oldValues = selected;
						$ctrl.selected = selected;
						$ctrl.dispatchChange();
					}
				}
			}, true);

		}
	};
}

export class UiListController {

	source: IOption[];
	selected: string[];
	searchLabel = '';
	maxHeight: string;
	minHeight: string;
	selectedGroup: string | null = null;
	label: string;
	id: string;

	onSelect: ActionEvent<IOption>;
	onChange: ActionEvent<string>;

	static $inject = ['$scope', '$filter', '$broadcast'];

	constructor(private $scope: IScope, private $filter: angular.IFilterService, private $broadcast: IBroadcastService) {
		this.$broadcast.onAction('setActiveItem', 'uiList', (args: IActionEventArgParam<IOption>) => {
			if (args.componentId == $scope.id) {
				this.handleActivate(args.args[0]);
			}
		});
	}

	selectAll() {
		const filtered = this.getFilteredItems(this.source);
		filtered.forEach((item: IOption) => {
			if (!item.disabled) {
				item.selected = true;
			}
		});
	}

	deselectAll() {
		const filtered = this.getFilteredItems(this.source);
		filtered.forEach((item: IOption) => {
			item.selected = false;
		});
	}

	inverseSelection() {
		const filtered = this.getFilteredItems(this.source);
		filtered.forEach((item: IOption) => {
			if (!item.disabled) {
				item.selected = !item.selected;
			}
		});
	}

	getFilteredItems(source: IOption[]): IOption[] {
		let filteredItems = source;

		if (this.selectedGroup) {
			filteredItems = this.$filter('filter')(filteredItems, { group: this.selectedGroup });
		}

		if (this.searchLabel) {
			filteredItems = this.$filter('filter')(filteredItems, { label: this.searchLabel });
		}

		return filteredItems;
	}

	getLabel() {
		return this.label?.replace(/{\s?total_num\s?}/g, String(this.source?.length))
			.replace(/{\s?selected_num\s?}/g, String(this.selected?.length));
	}

	getSelectedItems() {
		return this.source.filter((item: IOption) => item.selected);
	}

	handleActivate(item: IOption) {
		this.source.forEach((i: IOption) => {
			if (item !== i) {
				i.active = false;
			} else {
				i.active = true;
			}
		});
		this.$broadcast.broadcastAction('onSelect', 'uiList', {
			componentId: this.id,
			args: [item]
		});

		if (this.onSelect) {
			this.onSelect({
				args: {
					componentId: this.id,
					args: [item]
				}
			});
		}
	}

	dispatchChange() {
		this.$broadcast.broadcastAction('onChange', 'uiList', {
			componentId: this.id,
			args: this.selected
		});
		if (this.onChange) {
			this.onChange({
				args: {
					componentId: this.id,
					args: this.selected
				}
			});
		}
	}
}

export const uiListDirectiveModule = angular.module('uiListDirectiveModule', [])
	.directive('uiList', ['$timeout', uiListDirective])
	.filter('unique', function () {
		return function (collection: IOption[], keyname: keyof IOption) {
			const output = [];
			const keys = [];

			angular.forEach(collection, function (item) {
				const key = item[keyname];
				if (keys.indexOf(key) === -1) {
					keys.push(key);
					output.push(item);
				}
			});
			return output;
		};
	});
