import angular from 'angular';
import { DateFormat } from '../../../common';
import { CommonUtils } from '../../../utils';

interface ITableScope extends angular.IScope {
	source: any[];
	dateFormat: DateFormat;
	dateFormatString: string;
	search: string;
}

class TableDirectiveController {

	static $inject = ['$scope', '$filter'];

	columns: string[] = [];
	search = '';
	sort = { column: '', descending: false };
	rows: any[];
	source: any[] = [];
	columnTypes: any[] = [];

	constructor(private $scope: ITableScope, private $filter: angular.IFilterService) {

		$scope.$watch('$ctrl.source', (newVal: any[]) => {
			if (newVal && newVal.length) {
				this.columns = Object.keys(newVal[0]);
				this.rows = newVal;
				this.columnTypes = this.columns.reduce((types: any, column: string) => {
					types[column] = this.getColumnType(column);
					return types;
				}, {});
				this.rows.forEach((row: any) => {
					this.columns.forEach((column: string) => {
						if (this.columnTypes[column] === 'date') {
							row[column] = CommonUtils.toDateObject(row[column]);
						} else if (this.columnTypes[column] === 'number') {
							row[column] = parseFloat(row[column]);
						} else if (this.columnTypes[column] === 'boolean') {
							row[column] = !!row[column];
						} else {
							row[column] = row[column]?.toString();
						}
					});
				});
				this.buildTable();
			}
		});

		$scope.$watch('$ctrl.search', () => {
			this.buildTable();
		});
	}

	changeSorting(column: string) {
		const sort = this.sort;
		if (sort.column === column) {
			sort.descending = !sort.descending;
		} else {
			sort.column = column;
			sort.descending = false;
		}
		this.buildTable();
	}

	buildTable() {

		let filteredRows = this.source || [];

		// Apply search
		if (this.search) {
			filteredRows = filteredRows.filter((row: any) =>
				Object.values(row).some(value =>
					value?.toString().toLowerCase().includes(this.search.toLowerCase())));
		}

		// Apply sorting
		if (this.sort.column) {
			filteredRows.sort((a: any, b: any) => {
				const column = this.sort.column;
				const aValue = a[column];
				const bValue = b[column];
				const type = this.columnTypes[column];
				if (type === 'number') {
					return this.sort.descending ? bValue - aValue : aValue - bValue;
				} else if (type === 'string') {
					return this.sort.descending ? bValue?.localeCompare(aValue) : aValue?.localeCompare(bValue);
				} else if (type === 'date') {
					return this.sort.descending ? bValue.getTime() - aValue.getTime() : aValue.getTime() - bValue.getTime();
				} else if (type === 'boolean') {
					return this.sort.descending ? (bValue ? 1 : 0) - (aValue ? 1 : 0) : (aValue ? 1 : 0) - (bValue ? 1 : 0);
				}
				return 0;
			});
		}

		this.rows = filteredRows;
	}

	getColumnType(column: string) {

		if (!this.rows || !this.rows.length) {
			return 'string';
		}

		const value = this.rows[0][column];
		return typeof value == 'number' || typeof value == 'boolean' ? typeof value
			: CommonUtils.isValidDate(value) ? 'date'
				: 'string';
	}

	selectRow(row: any) {
		this.rows.forEach((x: any) => x.activeRow = false);
		row.activeRow = true;
	}
}

export function uiTable(): angular.IDirective {
	return {
		restrict: 'E',
		controller: TableDirectiveController,
		controllerAs: '$ctrl',
		bindToController: true,
		scope: {
			source: '=',
			dateFormat: '@',
			dateFormatString: '@',
			search: '@',
			tableClass: '@',
			tableStyle: '<'
		},
		template: `
		<div ng-if="$ctrl.source && $ctrl.source.length">
            <input type="search" class="form-control" ng-model="$ctrl.search" placeholder="{{ 'SEARCH_RECORDS_PLACEHOLDER' | translate }}"/>
            <div class="table-responsive mt-1" ng-class="$ctrl.tableClass" ng-style="$ctrl.tableStyle">
                <table class="table table-striped table-bordered table-hover">
                    <thead>
                        <tr>
                            <th ng-repeat="column in $ctrl.columns" ng-click="$ctrl.changeSorting(column)" class="cursor-pointer" tooltip="{{ 'CLICK_TO_SORT_TABLE_BY_THIS_COLUMN' | translate }}">
                                {{column}}
                                <i ng-if="$ctrl.sort.column === column" 
                                   class="fa" 
                                   ng-class="{'fa-sort-asc': !$ctrl.sort.descending, 'fa-sort-desc': $ctrl.sort.descending, 'fa-xs': true}"></i>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr ng-repeat="row in $ctrl.rows" ng-click="$ctrl.selectRow(row)" ng-class="{ 'table-active' : row.activeRow }">
                            <td ng-repeat="column in $ctrl.columns">
                                <span ng-if="$ctrl.columnTypes[column] == 'date' && $ctrl.dateFormat != 'custom'">{{row[column] | date:$ctrl.dateFormat}}</span>
                                <span ng-if="$ctrl.columnTypes[column] == 'date' && $ctrl.dateFormat == 'custom'">{{row[column] | date:$ctrl.dateFormatString}}</span>
								<span class="table-cell" ng-if="$ctrl.columnTypes[column] == 'boolean' || $ctrl.columnTypes[column] == 'number'">{{row[column]}}</span>
                                <span class="table-cell" ng-if="$ctrl.columnTypes[column] == 'string'" tooltip="{{row[column]}}">{{row[column]}}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
		</div>`
	};
}
