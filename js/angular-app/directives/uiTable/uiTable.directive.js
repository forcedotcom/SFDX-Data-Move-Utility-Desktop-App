"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiTable = void 0;
const utils_1 = require("../../../utils");
class TableDirectiveController {
    constructor($scope, $filter) {
        this.$scope = $scope;
        this.$filter = $filter;
        this.columns = [];
        this.search = '';
        this.sort = { column: '', descending: false };
        this.source = [];
        this.columnTypes = [];
        $scope.$watch('$ctrl.source', (newVal) => {
            if (newVal && newVal.length) {
                this.columns = Object.keys(newVal[0]);
                this.rows = newVal;
                this.columnTypes = this.columns.reduce((types, column) => {
                    types[column] = this.getColumnType(column);
                    return types;
                }, {});
                this.rows.forEach((row) => {
                    this.columns.forEach((column) => {
                        var _a;
                        if (this.columnTypes[column] === 'date') {
                            row[column] = utils_1.CommonUtils.toDateObject(row[column]);
                        }
                        else if (this.columnTypes[column] === 'number') {
                            row[column] = parseFloat(row[column]);
                        }
                        else if (this.columnTypes[column] === 'boolean') {
                            row[column] = !!row[column];
                        }
                        else {
                            row[column] = (_a = row[column]) === null || _a === void 0 ? void 0 : _a.toString();
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
    changeSorting(column) {
        const sort = this.sort;
        if (sort.column === column) {
            sort.descending = !sort.descending;
        }
        else {
            sort.column = column;
            sort.descending = false;
        }
        this.buildTable();
    }
    buildTable() {
        let filteredRows = this.source || [];
        // Apply search
        if (this.search) {
            filteredRows = filteredRows.filter((row) => Object.values(row).some(value => value === null || value === void 0 ? void 0 : value.toString().toLowerCase().includes(this.search.toLowerCase())));
        }
        // Apply sorting
        if (this.sort.column) {
            filteredRows.sort((a, b) => {
                const column = this.sort.column;
                const aValue = a[column];
                const bValue = b[column];
                const type = this.columnTypes[column];
                if (type === 'number') {
                    return this.sort.descending ? bValue - aValue : aValue - bValue;
                }
                else if (type === 'string') {
                    return this.sort.descending ? bValue === null || bValue === void 0 ? void 0 : bValue.localeCompare(aValue) : aValue === null || aValue === void 0 ? void 0 : aValue.localeCompare(bValue);
                }
                else if (type === 'date') {
                    return this.sort.descending ? bValue.getTime() - aValue.getTime() : aValue.getTime() - bValue.getTime();
                }
                else if (type === 'boolean') {
                    return this.sort.descending ? (bValue ? 1 : 0) - (aValue ? 1 : 0) : (aValue ? 1 : 0) - (bValue ? 1 : 0);
                }
                return 0;
            });
        }
        this.rows = filteredRows;
    }
    getColumnType(column) {
        if (!this.rows || !this.rows.length) {
            return 'string';
        }
        const value = this.rows[0][column];
        return typeof value == 'number' || typeof value == 'boolean' ? typeof value
            : utils_1.CommonUtils.isValidDate(value) ? 'date'
                : 'string';
    }
    selectRow(row) {
        this.rows.forEach((x) => x.activeRow = false);
        row.activeRow = true;
    }
}
TableDirectiveController.$inject = ['$scope', '$filter'];
function uiTable() {
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
exports.uiTable = uiTable;
//# sourceMappingURL=uiTable.directive.js.map