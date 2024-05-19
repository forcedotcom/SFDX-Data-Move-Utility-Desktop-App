
import { IAugmentedJQuery, IDirective, IScope, ITimeoutService } from 'angular';
import bootstrap, { Tooltip } from 'bootstrap';
import { ActionEvent } from '../../../common';
import { IOption } from '../../../models';
import { TranslationService } from '../../../services';
import { CommonUtils } from '../../../utils';

export interface UIDataTransferOptions {
	labelName?: string;
	groupItemName?: string;
	groupArrayName?: string;
	valueName?: string;
	tooltipName?: string;
	dataArray?: any[];
	groupDataArray?: any[];
	leftTabNameText?: string;
	rightTabNameText?: string;
	searchPlaceholderText?: string;
	dataErrorName?: string;
	collapsibleGroupes?: boolean;
	totalTextTemplate?: string;
}

interface IUITransferPickerScope extends IScope {
	selected: string[];
	onSelect: ActionEvent<IOption>;
	height: string;
	sourceItemsTitle: string;
	selectedItemsTitle: string;
}

export class UiTransferPickerDirective implements IDirective {

	restrict = 'E';
	scope = {
		id: '@',
		selected: '=',
		source: '=',
		onSelect: '&',
		height: '@',
		sourceItemsTitle: '@',
		selectedItemsTitle: '@',
	};
	template = '<div class="transfer" style="direction:ltr"></div>';

	constructor(private $translate: TranslationService, private $timeout: ITimeoutService) { }

	link($scope: IUITransferPickerScope, $element: IAugmentedJQuery) {

		// Assign default values to the scope
		Object.assign($scope, {
			id: $scope.id || CommonUtils.randomString(),
			height: $scope.height || "390px",
			// For the properties below, the default values are now set hard-coded,
			// but we can also set them dynamically from outside the directive upon need.
			sourceItemsTitle: $scope.selectedItemsTitle || this.$translate.translate({ key: 'AVAILABLE_ITEMS' }),
			selectedItemsTitle: $scope.selectedItemsTitle || this.$translate.translate({ key: 'SELECTED_ITEMS' }),
			searchPlaceholderText: this.$translate.translate({ key: 'SEARCH_PLACEHOLDER' }),
			totalTextTemplate: this.$translate.translate({ key: 'TOTAL_ITEMS' }),
			groupItemProperty: 'label',
			groupValueProperty: 'value',
			tooltipProperty: 'popover',
			groupByProperty: 'group',
			errorMessageProperty: 'errorMessage'
		});

		let cachedGroupData: IOption[] = [];
		let tooltips = [];

		const setup = (newValue: IOption[]) => {

			if (!CommonUtils.deepEquals(newValue, cachedGroupData)) {

				cachedGroupData = angular.copy(newValue);

				const groupDataArray = newValue.groupByProp(
					$scope.groupByProperty,
					'groupItem', 'groupArray'
				);

				groupDataArray.forEach(data => {
					(data.groupArray as any).forEach((item: IOption) => {
						if ($scope.selected && $scope.selected.includes(String(item.value))) {
							item.selected = true;
						}
					});
				});

				$element.find('.transfer')
					.empty()
					.transfer({
						groupDataArray,
						labelName: $scope.groupItemProperty,
						valueName: $scope.groupValueProperty,
						leftTabNameText: $scope.sourceItemsTitle,
						rightTabNameText: $scope.selectedItemsTitle,
						searchPlaceholderText: $scope.searchPlaceholderText,
						totalTextTemplate: $scope.totalTextTemplate,
						dataErrorName: $scope.errorMessageProperty,
						tooltipName: $scope.tooltipProperty,
						callable: (items: IOption[]) => {
							setTooltips();
							if ($scope.onSelect) {
								$scope.onSelect({
									args: {
										componentId: $scope.id,
										args: items
									}
								});
							}
						},
						onInit: onInit,
					} as UIDataTransferOptions);

			}
		};

		const refresh = () => {
			const oldData = cachedGroupData;
			cachedGroupData = [];
			setup(oldData);
		};

		const onInit = () => {
			// Set component height
			$element.find('.transfer-double').css('height', $scope.height);
			$element.find('.transfer-double-content-left,.transfer-double-content-right').attr('style', `height: calc(${$scope.height} - 78px);`);
			$element.find('.transfer-double-list-main,.transfer-double-selected-list-main').attr('style', `height: calc(${$scope.height} - 160px);`);
			$element.find('.transfer-double-content-middle').attr('style', `bottom: calc((${$scope.height} + 54px) / 2 + 5px); top: auto;`);

			// Set component tooltips
			setTooltips();
		}

		const setTooltips = () => {
			this.$timeout(() => {
				tooltips.forEach((tooltip: Tooltip) => {
					try { tooltip.dispose(); } catch (e) { }
				});
				tooltips = [];
				$element.find('[data-bs-toggle="tooltip"]').each((_, element) => {
					tooltips.push(new bootstrap.Tooltip(element));
				});

			}, 100, false)
		};

		$scope.$watchCollection('source', setup);

		$scope.$watchCollection('selected', (newValue: string[], oldValue: string[]) => {
			if (!CommonUtils.deepEquals(newValue, oldValue)) {
				refresh();
			}
		});

	}
}

