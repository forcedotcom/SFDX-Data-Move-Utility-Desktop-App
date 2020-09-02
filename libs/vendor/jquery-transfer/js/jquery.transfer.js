/**
 * jQuery transfer
 */
(function ($) {

    var Transfer = function (element, options) {

        this.$element = element;

        // default options
        this.defaults = {
            // data item name
            itemName: "item",
            // group data item name
            groupItemName: "groupItem",
            // group data array name
            groupArrayName: "groupArray",
            // data value name
            valueName: "value",
            // items data array
            dataArray: [],
            // group data array
            groupDataArray: [],
            // group tab text
            leftTabNameText: "Group items",
            // right tab text
            rightTabNameText: "Selected items",
            // search placeholder text
            searchPlaceholderText: "Search...",
            // Property of data error
            dataErrorName: "dataError",
            // Added collapsible behaivor to groupes
            collapsibleGroupes: true

        };

        // merge options
        this.settings = $.extend(this.defaults, options);

        // The total number of selected items
        this.selected_total_num = 0;
        // tab text
        this.tabNameText = "items";
        // group tab text
        this.groupTabNameText = this.settings.leftTabNameText;
        // right tab text
        this.rightTabNameText = this.settings.rightTabNameText;
        // search placeholder text
        this.searchPlaceholderText = this.settings.searchPlaceholderText;
        // default total number text template
        this.default_total_num_text_template = "Total: {total_num}";
        // default zero item
        this.default_right_item_total_num_text = get_total_num_text(this.default_total_num_text_template, 0);
        // item total number
        this.item_total_num = this.settings.dataArray.length;
        // group item total number
        this.group_item_total_num = get_group_items_num(this.settings.groupDataArray, this.settings.groupArrayName);
        // use group
        this.isGroup = this.group_item_total_num > 0;
        // inner data
        this._data = new InnerMap();

        // Id
        this.id = (getId())();
        // id selector for the item searcher
        this.itemSearcherId = "#listSearch_" + this.id;
        // id selector for the group item searcher
        this.groupItemSearcherId = "#groupListSearch_" + this.id;
        // id selector for the right searcher
        this.selectedItemSearcherId = "#selectedListSearch_" + this.id;

        // class selector for the transfer-double-list-ul
        this.transferDoubleListUlClass = ".transfer-double-list-ul-" + this.id;
        // class selector for the transfer-double-list-li
        this.transferDoubleListLiClass = ".transfer-double-list-li-" + this.id;
        // class selector for the left checkbox item
        this.checkboxItemClass = ".checkbox-item-" + this.id;
        // class selector for the left checkbox item label
        this.checkboxItemLabelClass = ".checkbox-name-" + this.id;
        // class selector for the left item total number label
        this.totalNumLabelClass = ".total_num_" + this.id;
        // id selector for the left item select all
        this.leftItemSelectAllId = "#leftItemSelectAll_" + this.id;
        // id selector for the right item select all
        this.rightItemSelectAllId = "#rightItemSelectAll_" + this.id;

        // class selector for the transfer-double-group-list-ul
        this.transferDoubleGroupListUlClass = ".transfer-double-group-list-ul-" + this.id;
        // class selector for the transfer-double-group-list-li
        this.transferDoubleGroupListLiClass = ".transfer-double-group-list-li-" + this.id;

        // class selector for the group select all
        this.groupSelectAllClass = ".group-select-all-" + this.id;
        // class selector fro the transfer-double-group-list-li-ul-li
        this.transferDoubleGroupListLiUlLiClass = ".transfer-double-group-list-li-ul-li-" + this.id;
        // class selector for the group-checkbox-item
        this.groupCheckboxItemClass = ".group-checkbox-item-" + this.id;
        // class selector for the group-checkbox-name
        this.groupCheckboxNameLabelClass = ".group-checkbox-name-" + this.id;
        // class selector for the left group item total number label
        this.groupTotalNumLabelClass = ".group_total_num_" + this.id;
        // id selector for the left group item select all
        this.groupItemSelectAllId = "#groupItemSelectAll_" + this.id;

        // class selector for the transfer-double-selected-list-ul
        this.transferDoubleSelectedListUlClass = ".transfer-double-selected-list-ul-" + this.id;
        // class selector for the transfer-double-selected-list-li
        this.transferDoubleSelectedListLiClass = ".transfer-double-selected-list-li-" + this.id;
        // class selector for the right select checkbox item
        this.checkboxSelectedItemClass = ".checkbox-selected-item-" + this.id;
        // id selector for the right item select all
        // TODO: next step use it
        this.rightItemSelectAllId = "#rightItemSelectAll_" + this.id;
        // class selector for the 
        this.selectedTotalNumLabelClass = ".selected_total_num_" + this.id;
        // id selector for the add button
        this.addSelectedButtonId = "#add_selected_" + this.id;
        // id selector for the delete button
        this.deleteSelectedButtonId = "#delete_selected_" + this.id;
        // Rectangle display
        this.exclamationRectangle = function (error) {
            return error ? ("<i data-toggle='tooltip' title='" + error + "' data-custom-class='tooltip-warning' class='fa fa-exclamation-triangle text-warning'></i>&nbsp;") : "";
        };
    }

    $.fn.transfer = function (options) {
        // new Transfer
        var transfer = new Transfer(this, options);
        // init
        transfer.init();

        return {
            // get selected items
            getSelectedItems: function () {
                return get_selected_items(transfer)
            }
        }
    }

    /**
     * init
     */
    Transfer.prototype.init = function () {
        // generate transfer
        this.$element.append(this.generate_transfer());

        if (this.isGroup) {
            // fill group data
            this.fill_group_data();

            // left group checkbox item click handler
            this.left_group_checkbox_item_click_handler();
            // group select all handler
            this.group_select_all_handler();
            // group collapse expand
            this.checkbox_group_click_handler();
            // group item select all handler
            this.group_item_select_all_handler();
            // right group items search handler
            this.right_item_select_all_handler();
            // left group items search handler
            this.left_group_items_search_handler();

        } else {
            // fill data
            this.fill_data();

            // left checkbox item click handler
            this.left_checkbox_item_click_handler();
            // left item select all handler
            this.left_item_select_all_handler();
            // left items search handler
            this.left_items_search_handler();
        }

        // right checkbox item click handler
        this.right_checkbox_item_click_handler();
        // move the pre-selection items to the right handler
        this.move_pre_selection_items_handler();
        // move the selected item to the left handler
        this.move_selected_items_handler();
        // right items search handler
        this.right_items_search_handler();
    }

    /**
     * generate transfer
     */
    Transfer.prototype.generate_transfer = function () {
        var html =
            '<div class="transfer-double" id="transfer_double_' + this.id + '">' +
            '<div class="transfer-double-header"></div>' +
            '<div class="transfer-double-content clearfix">' +
            this.generate_left_part() +
            '<div class="transfer-double-content-middle">' +
            '<div class="btn-select-arrow" id="add_selected_' + this.id + '"><i class="iconfont icon-forward"></i></div>' +
            '<div class="btn-select-arrow" id="delete_selected_' + this.id + '"><i class="iconfont icon-back"></i></div>' +
            '</div>' +
            this.generate_right_part() +
            '</div>' +
            '<div class="transfer-double-footer"></div>' +
            '</div>';
        return html;
    }

    /**
     * generate transfer's left part
     */
    Transfer.prototype.generate_left_part = function () {
        return '<div class="transfer-double-content-left">' +
            '<div class="transfer-double-content-param">' +
            '<div class="param-item">' + (this.isGroup ? this.groupTabNameText : this.tabNameText) + '</div>' +
            '</div>' +
            (this.isGroup ? this.generate_group_items_container() : this.generate_items_container()) +
            '</div>'
    }

    /**
     * generate group items container
     */
    Transfer.prototype.generate_group_items_container = function () {
        return '<div class="transfer-double-list transfer-double-list-' + this.id + '">' +
            '<div class="transfer-double-list-header">' +
            '<div class="transfer-double-list-search">' +
            '<input class="transfer-double-list-search-input" type="text" id="groupListSearch_' + this.id + '" placeholder="' + this.searchPlaceholderText + '" value="" />' +
            '</div>' +
            '</div>' +
            '<div class="transfer-double-list-content">' +
            '<div class="transfer-double-list-main">' +
            '<ul class="transfer-double-group-list-ul transfer-double-group-list-ul-' + this.id + '">' +
            '</ul>' +
            '</div>' +
            '</div>' +
            '<div class="transfer-double-list-footer">' +
            '<div class="checkbox-group">' +
            '<input type="checkbox" class="checkbox-normal" id="groupItemSelectAll_' + this.id + '"><label for="groupItemSelectAll_' + this.id + '" class="group_total_num_' + this.id + '"></label>' +
            '</div>' +
            '</div>' +
            '</div>'
    }

    /**
     * generate items container
     */
    Transfer.prototype.generate_items_container = function () {
        return '<div class="transfer-double-list transfer-double-list-' + this.id + '">' +
            '<div class="transfer-double-list-header">' +
            '<div class="transfer-double-list-search">' +
            '<input class="transfer-double-list-search-input" type="text" id="listSearch_' + this.id + '" placeholder="' + this.searchPlaceholderText + '" value="" />' +
            '</div>' +
            '</div>' +
            '<div class="transfer-double-list-content">' +
            '<div class="transfer-double-list-main">' +
            '<ul class="transfer-double-list-ul transfer-double-list-ul-' + this.id + '">' +
            '</ul>' +
            '</div>' +
            '</div>' +
            '<div class="transfer-double-list-footer">' +
            '<div class="checkbox-group">' +
            '<input type="checkbox" class="checkbox-normal" id="leftItemSelectAll_' + this.id + '"><label for="leftItemSelectAll_' + this.id + '" class="total_num_' + this.id + '"></label>' +
            '</div>' +
            '</div>' +
            '</div>'
    }

    /**
     * generate transfer's right part
     */
    Transfer.prototype.generate_right_part = function () {
        return '<div class="transfer-double-content-right">' +
            '<div class="transfer-double-content-param">' +
            '<div class="param-item">' + this.rightTabNameText + '</div>' +
            '</div>' +
            '<div class="transfer-double-selected-list">' +
            '<div class="transfer-double-selected-list-header">' +
            '<div class="transfer-double-selected-list-search">' +
            '<input class="transfer-double-selected-list-search-input" type="text" id="selectedListSearch_' + this.id + '" placeholder="' + this.searchPlaceholderText + '" value="" />' +
            '</div>' +
            '</div>' +
            '<div class="transfer-double-selected-list-content">' +
            '<div class="transfer-double-selected-list-main">' +
            '<ul class="transfer-double-selected-list-ul transfer-double-selected-list-ul-' + this.id + '">' +
            '</ul>' +
            '</div>' +
            '</div>' +
            '<div class="transfer-double-list-footer">' +
            '<div class="checkbox-group">' +
            '<input type="checkbox" class="checkbox-normal" id="rightItemSelectAll_' + this.id + '"><label class="selected_total_num_' + this.id + '" for="rightItemSelectAll_' + this.id + '">' + this.default_right_item_total_num_text + '</label>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>'
    }

    /**
     * fill data
     */
    Transfer.prototype.fill_data = function () {
        this.$element.find(this.transferDoubleListUlClass).empty();
        this.$element.find(this.transferDoubleListUlClass).append(this.generate_left_items());

        this.$element.find(this.transferDoubleSelectedListUlClass).empty();
        this.$element.find(this.transferDoubleSelectedListUlClass).append(this.generate_right_items());

        // render total num
        this.$element.find(this.totalNumLabelClass).empty();
        this.$element.find(this.totalNumLabelClass).append(get_total_num_text(this.default_total_num_text_template, this._data.get("total_count")));

        // render right total num
        this.$element.find(this.selectedTotalNumLabelClass).empty();
        this.$element.find(this.selectedTotalNumLabelClass).append(get_total_num_text(this.default_total_num_text_template, this.selected_total_num));

        // callable
        applyCallable(this);
    }

    /**
     * fill group data
     */
    Transfer.prototype.fill_group_data = function () {
        this.$element.find(this.transferDoubleGroupListUlClass).empty();
        this.$element.find(this.transferDoubleGroupListUlClass).append(this.generate_left_group_items());

        this.$element.find(this.transferDoubleSelectedListUlClass).empty();
        this.$element.find(this.transferDoubleSelectedListUlClass).append(this.generate_right_group_items());

        var self = this;
        var total_count = 0;
        this._data.forEach(function (key, value) {
            total_count += value["total_count"]
            value["total_count"] == 0 ? self.$element.find("#" + key).prop("disabled", true).prop("checked", true) : void (0)
        })

        // render total num
        this.$element.find(this.groupTotalNumLabelClass).empty();
        this.$element.find(this.groupTotalNumLabelClass).append(get_total_num_text(this.default_total_num_text_template, total_count));

        // render right total num
        this.$element.find(this.selectedTotalNumLabelClass).empty();
        this.$element.find(this.selectedTotalNumLabelClass).append(get_total_num_text(this.default_total_num_text_template, this.selected_total_num));

        // callable
        applyCallable(this);
    }

    /**
     * generate left items
     */
    Transfer.prototype.generate_left_items = function () {
        var html = "";
        var dataArray = this.settings.dataArray;
        var itemName = this.settings.itemName;
        var valueName = this.settings.valueName;
        var dataErrorName = this.settings.dataErrorName;

        for (var i = 0; i < dataArray.length; i++) {

            var selected = dataArray[i].selected || false;
            selected ? this.selected_total_num++ : void (0)

            html +=
                '<li class="transfer-double-list-li transfer-double-list-li-' + this.id + ' ' + (selected ? 'selected-hidden' : '') + '">' +
                '<div class="checkbox-group">' +
                '<input type="checkbox" value="' + dataArray[i][valueName] + '" class="checkbox-normal checkbox-item-' +
                this.id + '" id="itemCheckbox_' + i + '_' + this.id + '">' +
                '<label data-error="' + dataArray[i][dataErrorName] + '" class="checkbox-name-' + this.id + '" for="itemCheckbox_' + i + '_' + this.id + '">' +
                this.exclamationRectangle(dataArray[i][dataErrorName]) + dataArray[i][itemName]  +
                '</label>' +
                '</div>' +
                '</li>'
        }

        this._data.put("pre_selection_count", 0);
        this._data.put("total_count", dataArray.length - this.selected_total_num);

        return html;
    }

    /**
     * render left group items
     */
    Transfer.prototype.generate_left_group_items = function () {
        var html = "";
        var id = this.id;
        var groupDataArray = this.settings.groupDataArray;
        var groupItemName = this.settings.groupItemName;
        var groupArrayName = this.settings.groupArrayName;
        var itemName = this.settings.itemName;
        var valueName = this.settings.valueName;
        var dataErrorName = this.settings.dataErrorName;

        for (var i = 0; i < groupDataArray.length; i++) {
            if (groupDataArray[i][groupArrayName] && groupDataArray[i][groupArrayName].length > 0) {

                var _value = {};
                _value["pre_selection_count"] = 0
                _value["total_count"] = groupDataArray[i][groupArrayName].length
                this._data.put('group_' + i + '_' + this.id, _value);

                html +=
                    '<li class="transfer-double-group-list-li transfer-double-group-list-li-' + id + '">' +
                    '<div class="checkbox-group">' +
                    '<input type="checkbox" class="checkbox-normal group-select-all-' + id + '" id="group_' + i + '_' + id + '">' +
                    '<label data-error="' + groupDataArray[i][dataErrorName] + '" for="group_' + i + '_' + id + '" class="group-name-' + id + '">' +
                    this.exclamationRectangle(groupDataArray[i][dataErrorName]) + groupDataArray[i][groupItemName] +
                    '</label>' +
                    '</div>';

                html += '<ul class="transfer-double-group-list-li-ul transfer-double-group-list-li-ul-' + id + '" style="display:none">'
                for (var j = 0; j < groupDataArray[i][groupArrayName].length; j++) {

                    var selected = groupDataArray[i][groupArrayName][j].selected || false;
                    selected ? this.selected_total_num++ : void (0)

                    var groupItem = this._data.get('group_' + i + '_' + this.id);
                    selected ? groupItem["total_count"] -= 1 : void (0)

                    html += '<li class="transfer-double-group-list-li-ul-li transfer-double-group-list-li-ul-li-' + id + ' ' + (selected ? 'selected-hidden' : '') + '">' +
                        '<div class="checkbox-group">' +
                        '<input type="checkbox" value="' + groupDataArray[i][groupArrayName][j][valueName] + '" class="checkbox-normal group-checkbox-item-' + id + ' belongs-group-' + i + '-' + id + '" id="group_' + i + '_checkbox_' + j + '_' + id + '">' +
                        '<label data-error="' + groupDataArray[i][groupArrayName][j][dataErrorName] + '" for="group_' + i + '_checkbox_' + j + '_' + id + '" class="group-checkbox-name-' + id + '">' +
                        this.exclamationRectangle(groupDataArray[i][groupArrayName][j][dataErrorName]) + groupDataArray[i][groupArrayName][j][itemName] +
                        '</label>' +
                        '</div>' +
                        '</li>';
                }
                html += '</ul></li>'
            }
        }

        return html;
    }

    /**
     * generate right items
     */
    Transfer.prototype.generate_right_items = function () {
        var html = "";
        var dataArray = this.settings.dataArray;
        var itemName = this.settings.itemName;
        var valueName = this.settings.valueName;
        var dataErrorName = this.settings.dataErrorName;

        for (var i = 0; i < dataArray.length; i++) {
            if (dataArray[i].selected || false) {
                html += this.generate_item(this.id, i, dataArray[i][valueName], dataArray[i][itemName], dataArray[i][dataErrorName]);
            }
        }
        return html;
    }

    /**
     * generate right group items
     */
    Transfer.prototype.generate_right_group_items = function () {
        var html = "";
        var groupDataArray = this.settings.groupDataArray;
        var groupArrayName = this.settings.groupArrayName;
        var itemName = this.settings.itemName;
        var valueName = this.settings.valueName;
        var dataErrorName = this.settings.dataErrorName;

        for (var i = 0; i < groupDataArray.length; i++) {
            if (groupDataArray[i][groupArrayName] && groupDataArray[i][groupArrayName].length > 0) {
                for (var j = 0; j < groupDataArray[i][groupArrayName].length; j++) {
                    if (groupDataArray[i][groupArrayName][j].selected || false) {
                        html += this.generate_group_item(this.id, i, j,
                            groupDataArray[i][groupArrayName][j][valueName],
                            groupDataArray[i][groupArrayName][j][itemName],
                            groupDataArray[i][groupArrayName][j][dataErrorName]
                        );
                    }
                }
            }
        }
        return html;
    }

    /**
     * left checkbox item click handler
     */
    Transfer.prototype.left_checkbox_item_click_handler = function () {
        var self = this;
        self.$element.on("click", self.checkboxItemClass, function () {
            var pre_selection_num = 0;
            $(this).is(":checked") ? pre_selection_num++ : pre_selection_num--

            var pre_selection_count = self._data.get("pre_selection_count");
            self._data.put("pre_selection_count", pre_selection_count + pre_selection_num);

            if (self._data.get("pre_selection_count") > 0) {
                $(self.addSelectedButtonId).addClass("btn-arrow-active");
            } else {
                $(self.addSelectedButtonId).removeClass("btn-arrow-active");
            }

            if (self._data.get("pre_selection_count") < self._data.get("total_count")) {
                $(self.leftItemSelectAllId).prop("checked", false);
            } else if (self._data.get("pre_selection_count") == self._data.get("total_count")) {
                $(self.leftItemSelectAllId).prop("checked", true);
            }
        });
    }

    /**
     * left group checkbox item click handler
     */
    Transfer.prototype.left_group_checkbox_item_click_handler = function () {
        var self = this;
        self.$element.on("click", self.groupCheckboxItemClass, function () {
            var pre_selection_num = 0;
            var total_pre_selection_num = 0;
            var remain_total_count = 0

            $(this).is(":checked") ? pre_selection_num++ : pre_selection_num--;

            var groupIndex = $(this).prop("id").split("_")[1];
            var groupItem = self._data.get('group_' + groupIndex + '_' + self.id);
            var pre_selection_count = groupItem["pre_selection_count"];
            groupItem["pre_selection_count"] = pre_selection_count + pre_selection_num

            self._data.forEach(function (key, value) {
                total_pre_selection_num += value["pre_selection_count"]
                remain_total_count += value["total_count"]
            });

            if (total_pre_selection_num > 0) {
                $(self.addSelectedButtonId).addClass("btn-arrow-active");
            } else {
                $(self.addSelectedButtonId).removeClass("btn-arrow-active");
            }

            if (groupItem["pre_selection_count"] < groupItem["total_count"]) {
                self.$element.find("#group_" + groupIndex + "_" + self.id).prop("checked", false);
            } else if (groupItem["pre_selection_count"] == groupItem["total_count"]) {
                self.$element.find("#group_" + groupIndex + "_" + self.id).prop("checked", true);
            }

            if (total_pre_selection_num == remain_total_count) {
                $(self.groupItemSelectAllId).prop("checked", true);
            } else {
                $(self.groupItemSelectAllId).prop("checked", false);
            }
        });
    }

    Transfer.prototype.checkbox_group_click_handler = function () {
        var self = this;
        self.$element.on("click", '.transfer-double-group-list-li>.checkbox-group', function (e) {
            e.stopImmediatePropagation();
            //if (e.offsetX <= e.target.offsetLeft) {
            if (e.offsetX < 0) {
                if ($(this).has('>input[type=checkbox][disabled]').length == 0) {
                    var groupContentDiv = $(this).next();
                    if ($(this).is('.expanded')) {
                        $(this).removeClass('expanded');
                        groupContentDiv.slideUp();
                    } else {
                        $(this).addClass('expanded');
                        groupContentDiv.slideDown();
                    }
                }
            }
        });
    }


    /**
     * group select all handler
     */
    Transfer.prototype.group_select_all_handler = function () {
        var self = this;
        $(self.groupSelectAllClass).on("click", function (e) {
            e.stopImmediatePropagation();

            var pre_selection_count = 0;
            var total_count = 0;

            // group index
            var groupIndex = ($(this).attr("id")).split("_")[1];
            var groups = self.$element.find(".belongs-group-" + groupIndex + "-" + self.id);


            // a group is checked
            if ($(this).is(':checked')) {
                // active button
                $(self.addSelectedButtonId).addClass("btn-arrow-active");
                for (var i = 0; i < groups.length; i++) {
                    if (!groups.eq(i).is(':checked') && groups.eq(i).parent("div").parent("li").css("display") != "none") {
                        groups.eq(i).prop("checked", true);
                    }
                }

                var groupItem = self._data.get($(this).prop("id"));
                groupItem["pre_selection_count"] = groupItem["total_count"];

                self._data.forEach(function (key, value) {
                    pre_selection_count += value["pre_selection_count"];
                    total_count += value["total_count"];
                })

                if (pre_selection_count == total_count) {
                    $(self.groupItemSelectAllId).prop("checked", true);
                }
            } else {
                for (var j = 0; j < groups.length; j++) {
                    if (groups.eq(j).is(':checked') && groups.eq(j).parent("div").parent("li").css("display") != "none") {
                        groups.eq(j).prop("checked", false);
                    }
                }

                self._data.get($(this).prop("id"))["pre_selection_count"] = 0;

                self._data.forEach(function (key, value) {
                    pre_selection_count += value["pre_selection_count"];
                    total_count += value["total_count"];
                })

                if (pre_selection_count != total_count) {
                    $(self.groupItemSelectAllId).prop("checked", false);
                }

                if (pre_selection_count == 0) {
                    $(self.addSelectedButtonId).removeClass("btn-arrow-active");
                }
            }
        });
    }



    /**
     * group item select all handler
     */
    Transfer.prototype.group_item_select_all_handler = function () {
        var self = this;
        $(self.groupItemSelectAllId).on("click", function () {
            var groupCheckboxItems = self.$element.find(self.groupCheckboxItemClass);
            if ($(this).is(':checked')) {
                for (var i = 0; i < groupCheckboxItems.length; i++) {
                    if (groupCheckboxItems.parent("div").parent("li").eq(i).css('display') != "none" && !groupCheckboxItems.eq(i).is(':checked')) {
                        groupCheckboxItems.eq(i).prop("checked", true);
                    }
                    if (!self.$element.find(self.groupSelectAllClass).eq(i).is(':checked')) {
                        self.$element.find(self.groupSelectAllClass).eq(i).prop("checked", true);
                    }
                }

                self._data.forEach(function (key, value) {
                    value["pre_selection_count"] = value["total_count"];
                })

                $(self.addSelectedButtonId).addClass("btn-arrow-active");
            } else {
                for (var i = 0; i < groupCheckboxItems.length; i++) {
                    if (groupCheckboxItems.parent("div").parent("li").eq(i).css('display') != "none" && groupCheckboxItems.eq(i).is(':checked')) {
                        groupCheckboxItems.eq(i).prop("checked", false);
                    }
                    if (self.$element.find(self.groupSelectAllClass).eq(i).is(':checked')) {
                        self.$element.find(self.groupSelectAllClass).eq(i).prop("checked", false);
                    }
                }

                self._data.forEach(function (key, value) {
                    value["pre_selection_count"] = 0;
                })

                $(self.addSelectedButtonId).removeClass("btn-arrow-active");
            }
        });
    }

    /**
     * left group items search handler
     */
    Transfer.prototype.left_group_items_search_handler = function () {
        var self = this;
        $(self.groupItemSearcherId).on("keyup", function () {
            self.$element.find(self.transferDoubleGroupListUlClass).css('display', 'block');
            var transferDoubleGroupListLiUlLis = self.$element.find(self.transferDoubleGroupListLiUlLiClass);
            if ($(self.groupItemSearcherId).val() == "") {
                for (var i = 0; i < transferDoubleGroupListLiUlLis.length; i++) {
                    if (!transferDoubleGroupListLiUlLis.eq(i).hasClass("selected-hidden")) {
                        transferDoubleGroupListLiUlLis.eq(i).parent("ul").parent("li").css('display', 'block');
                        transferDoubleGroupListLiUlLis.eq(i).css('display', 'block');
                    } else {
                        transferDoubleGroupListLiUlLis.eq(i).parent("ul").parent("li").css('display', 'block');
                    }
                }
                return;
            }

            // Mismatch
            self.$element.find(self.transferDoubleGroupListLiClass).css('display', 'none');
            transferDoubleGroupListLiUlLis.css('display', 'none');
            var searchString = $(self.groupItemSearcherId).val().toLowerCase();

            for (var j = 0; j < transferDoubleGroupListLiUlLis.length; j++) {
                if (!transferDoubleGroupListLiUlLis.eq(j).hasClass("selected-hidden") &&
                    (
                        transferDoubleGroupListLiUlLis.eq(j).text().toLowerCase().indexOf(searchString) >= 0 ||
                        transferDoubleGroupListLiUlLis.eq(j).parent("ul").parent("li").find('> .checkbox-group > label').text().toLowerCase().indexOf(searchString) >= 0
                    )) {
                    transferDoubleGroupListLiUlLis.eq(j).parent("ul").parent("li").css('display', 'block');
                    transferDoubleGroupListLiUlLis.eq(j).css('display', 'block');
                }
            }
        });
    }

    /**
     * right item select all handler
     */
    Transfer.prototype.right_item_select_all_handler = function () {
        var self = this;
        $(self.rightItemSelectAllId).on("click", function () {
            var checked = $(this).is(':checked');
            var checkboxItems = self.$element.find(self.checkboxSelectedItemClass);
            for (var i = 0; i < checkboxItems.length; i++) {
                checkboxItems.eq(i).click();
                if (checkboxItems.eq(i).prop('checked') != checked) {
                    checkboxItems.eq(i).click();
                }
            }
        });
    }

    /**
     * left item select all handler
     */
    Transfer.prototype.left_item_select_all_handler = function () {
        var self = this;
        $(self.leftItemSelectAllId).on("click", function () {
            var checkboxItems = self.$element.find(self.checkboxItemClass);
            if ($(this).is(':checked')) {
                for (var i = 0; i < checkboxItems.length; i++) {
                    if (checkboxItems.eq(i).parent("div").parent("li").css('display') != "none" && !checkboxItems.eq(i).is(':checked')) {
                        checkboxItems.eq(i).prop("checked", true);
                    }
                }
                self._data.put("pre_selection_count", self._data.get("total_count"));
                $(self.addSelectedButtonId).addClass("btn-arrow-active");
            } else {
                for (var i = 0; i < checkboxItems.length; i++) {
                    if (checkboxItems.eq(i).parent("div").parent("li").css('display') != "none" && checkboxItems.eq(i).is(':checked')) {
                        checkboxItems.eq(i).prop("checked", false);
                    }
                }
                $(self.addSelectedButtonId).removeClass("btn-arrow-active");
                self._data.put("pre_selection_count", 0);
            }
        });
    }

    /**
     * left items search handler
     */
    Transfer.prototype.left_items_search_handler = function () {
        var self = this;
        $(self.itemSearcherId).on("keyup", function () {
            var transferDoubleListLis = self.$element.find(self.transferDoubleListLiClass);
            self.$element.find(self.transferDoubleListUlClass).css('display', 'block');
            if ($(self.itemSearcherId).val() == "") {
                for (var i = 0; i < transferDoubleListLis.length; i++) {
                    if (!transferDoubleListLis.eq(i).hasClass("selected-hidden")) {
                        self.$element.find(self.transferDoubleListLiClass).eq(i).css('display', 'block');
                    }
                }
                return;
            }

            transferDoubleListLis.css('display', 'none');
            var searchString = $(self.itemSearcherId).val().toLowerCase();

            for (var j = 0; j < transferDoubleListLis.length; j++) {
                if (!transferDoubleListLis.eq(j).hasClass("selected-hidden") &&
                    transferDoubleListLis.eq(j).text().toLowerCase().indexOf(searchString) >= 0) {
                    transferDoubleListLis.eq(j).css('display', 'block');
                }
            }
        });
    }

    /**
     * right checkbox item click handler
     */
    Transfer.prototype.right_checkbox_item_click_handler = function () {
        var self = this;
        self.$element.on("click", self.checkboxSelectedItemClass, function () {
            var pre_selection_num = 0;
            var total_num = 0;
            for (var i = 0; i < self.$element.find(self.checkboxSelectedItemClass).length; i++) {
                if (self.$element.find(self.checkboxSelectedItemClass).eq(i).is(':checked')) {
                    pre_selection_num++;
                }
                total_num++;
            }
            if (pre_selection_num > 0) {
                $(self.deleteSelectedButtonId).addClass("btn-arrow-active");
            } else {
                $(self.deleteSelectedButtonId).removeClass("btn-arrow-active");
            }
            $(self.rightItemSelectAllId).prop('checked', pre_selection_num == total_num);
        });
    }

    /**
     * move the pre-selection items to the right handler
     */
    Transfer.prototype.move_pre_selection_items_handler = function () {
        var self = this;
        $(self.addSelectedButtonId).on("click", function () {
            self.isGroup ? self.move_pre_selection_group_items() : self.move_pre_selection_items()
            $(self.rightItemSelectAllId).prop('checked', false);
            // callable
            applyCallable(self);
        });
    }

    /**
     * move the pre-selection group items to the right
     */
    Transfer.prototype.move_pre_selection_group_items = function () {
        var pre_selection_num = 0;
        var html = "";
        var groupCheckboxItems = this.$element.find(this.groupCheckboxItemClass);
        for (var i = 0; i < groupCheckboxItems.length; i++) {
            if (!groupCheckboxItems.eq(i).parent("div").parent("li").hasClass("selected-hidden") && groupCheckboxItems.eq(i).is(':checked')) {
                var checkboxItemId = groupCheckboxItems.eq(i).attr("id");
                var groupIndex = checkboxItemId.split("_")[1];
                var itemIndex = checkboxItemId.split("_")[3];
                var labelText = this.$element.find(this.groupCheckboxNameLabelClass).eq(i).text();
                var dataError = this.$element.find(this.groupCheckboxNameLabelClass).eq(i).attr('data-error');
                var value = groupCheckboxItems.eq(i).val();

                html += this.generate_group_item(this.id, groupIndex, itemIndex, value, labelText, dataError);
                groupCheckboxItems.parent("div").parent("li").eq(i).css("display", "").addClass("selected-hidden");
                pre_selection_num++;

                var groupItem = this._data.get('group_' + groupIndex + '_' + this.id);
                var total_count = groupItem["total_count"];
                var pre_selection_count = groupItem["pre_selection_count"];
                groupItem["total_count"] = --total_count;
                groupItem["pre_selection_count"] = --pre_selection_count;
            }
        }

        if (pre_selection_num > 0) {
            var groupSelectAllArray = this.$element.find(this.groupSelectAllClass);
            for (var j = 0; j < groupSelectAllArray.length; j++) {
                if (groupSelectAllArray.eq(j).is(":checked")) {
                    groupSelectAllArray.eq(j).prop("disabled", "disabled");
                }
            }

            var remain_total_count = 0;
            this._data.forEach(function (key, value) {
                remain_total_count += value["total_count"];
            })
            this.selected_total_num = this.group_item_total_num - remain_total_count;

            var groupTotalNumLabel = this.$element.find(this.groupTotalNumLabelClass);
            groupTotalNumLabel.empty();
            groupTotalNumLabel.append(get_total_num_text(this.default_total_num_text_template, remain_total_count));
            this.$element.find(this.selectedTotalNumLabelClass).text(get_total_num_text(this.default_total_num_text_template, this.selected_total_num));

            if (remain_total_count == 0) {
                $(this.groupItemSelectAllId).prop("checked", true).prop("disabled", "disabled");
            }

            $(this.addSelectedButtonId).removeClass("btn-arrow-active");
            var transferDoubleSelectedListUl = this.$element.find(this.transferDoubleSelectedListUlClass);
            transferDoubleSelectedListUl.append(html);
        }
    }

    /**
     * move the pre-selection items to the right
     */
    Transfer.prototype.move_pre_selection_items = function () {
        var pre_selection_num = 0;
        var html = "";
        var self = this;
        var checkboxItems = self.$element.find(self.checkboxItemClass);
        for (var i = 0; i < checkboxItems.length; i++) {
            if (checkboxItems.eq(i).parent("div").parent("li").css("display") != "none" && checkboxItems.eq(i).is(':checked')) {
                var checkboxItemId = checkboxItems.eq(i).attr("id");
                // checkbox item index
                var index = checkboxItemId.split("_")[1];
                var labelText = self.$element.find(self.checkboxItemLabelClass).eq(i).text();
                var dataError = self.$element.find(self.checkboxItemLabelClass).eq(i).attr('data-error');
                var value = checkboxItems.eq(i).val();
                self.$element.find(self.transferDoubleListLiClass).eq(i).css("display", "").addClass("selected-hidden");
                html += self.generate_item(self.id, index, value, labelText, dataError);
                pre_selection_num++;

                var pre_selection_count = self._data.get("pre_selection_count");
                var total_count = self._data.get("total_count");
                self._data.put("pre_selection_count", --pre_selection_count);
                self._data.put("total_count", --total_count);
            }
        }
        if (pre_selection_num > 0) {
            var totalNumLabel = self.$element.find(self.totalNumLabelClass);
            totalNumLabel.empty();

            self.selected_total_num += pre_selection_num
            totalNumLabel.append(get_total_num_text(self.default_total_num_text_template, self._data.get("total_count")));
            self.$element.find(self.selectedTotalNumLabelClass).text(get_total_num_text(self.default_total_num_text_template, self.selected_total_num));
            if (self._data.get("total_count") == 0) {
                $(self.leftItemSelectAllId).prop("checked", true).prop("disabled", "disabled");
            }

            $(self.addSelectedButtonId).removeClass("btn-arrow-active");
            self.$element.find(self.transferDoubleSelectedListUlClass).append(html);
        }
    }

    /**
     * move the selected item to the left handler
     */
    Transfer.prototype.move_selected_items_handler = function () {
        var self = this;
        $(self.deleteSelectedButtonId).on("click", function () {
            self.isGroup ? self.move_selected_group_items() : self.move_selected_items()
            $(self.deleteSelectedButtonId).removeClass("btn-arrow-active");
            $(self.rightItemSelectAllId).prop('checked', false);
            // callable
            applyCallable(self);
        });
    }

    /**
     * move the selected group item to the left
     */
    Transfer.prototype.move_selected_group_items = function () {
        var pre_selection_num = 0;
        var checkboxSelectedItems = this.$element.find(this.checkboxSelectedItemClass);
        for (var i = 0; i < checkboxSelectedItems.length;) {
            var another_checkboxSelectedItems = this.$element.find(this.checkboxSelectedItemClass);
            if (another_checkboxSelectedItems.eq(i).is(':checked')) {
                var checkboxSelectedItemId = another_checkboxSelectedItems.eq(i).attr("id");
                var groupIndex = checkboxSelectedItemId.split("_")[1];
                var index = checkboxSelectedItemId.split("_")[3];

                another_checkboxSelectedItems.parent("div").parent("li").eq(i).remove();
                this.$element.find("#group_" + groupIndex + "_" + this.id).prop("checked", false).removeAttr("disabled");
                this.$element.find("#group_" + groupIndex + "_checkbox_" + index + "_" + this.id)
                    .prop("checked", false).parent("div").parent("li").css("display", "").removeClass("selected-hidden");

                pre_selection_num++;

                var groupItem = this._data.get('group_' + groupIndex + '_' + this.id);
                var total_count = groupItem["total_count"];
                groupItem["total_count"] = ++total_count;

            } else {
                i++;
            }
        }
        if (pre_selection_num > 0) {
            this.$element.find(this.groupTotalNumLabelClass).empty();

            var remain_total_count = 0;
            this._data.forEach(function (key, value) {
                remain_total_count += value["total_count"];
            })

            this.selected_total_num -= pre_selection_num;

            this.$element.find(this.groupTotalNumLabelClass).append(get_total_num_text(this.default_total_num_text_template, remain_total_count));
            this.$element.find(this.selectedTotalNumLabelClass).text(get_total_num_text(this.default_total_num_text_template, this.selected_total_num));
            if ($(this.groupItemSelectAllId).is(':checked')) {
                $(this.groupItemSelectAllId).prop("checked", false).removeAttr("disabled");
            }
        }
    }

    /**
     * move the selected item to the left
     */
    Transfer.prototype.move_selected_items = function () {
        var pre_selection_num = 0;
        var self = this;
        for (var i = 0; i < self.$element.find(self.checkboxSelectedItemClass).length;) {
            var checkboxSelectedItems = self.$element.find(self.checkboxSelectedItemClass);
            if (checkboxSelectedItems.eq(i).is(':checked')) {
                var index = checkboxSelectedItems.eq(i).attr("id").split("_")[1];
                checkboxSelectedItems.parent("div").parent("li").eq(i).remove();
                self.$element.find(self.checkboxItemClass).eq(index).prop("checked", false);
                self.$element.find(self.transferDoubleListLiClass).eq(index).css("display", "").removeClass("selected-hidden");

                pre_selection_num++;

                var total_count = self._data.get("total_count");
                self._data.put("total_count", ++total_count);

            } else {
                i++;
            }
        }

        if (pre_selection_num > 0) {
            self.$element.find(self.totalNumLabelClass).empty();
            self.selected_total_num -= pre_selection_num;
            self.$element.find(self.totalNumLabelClass).append(get_total_num_text(self.default_total_num_text_template, self._data.get("total_count")));
            self.$element.find(self.selectedTotalNumLabelClass).text(get_total_num_text(self.default_total_num_text_template, self.selected_total_num));
            if ($(self.leftItemSelectAllId).is(':checked')) {
                $(self.leftItemSelectAllId).prop("checked", false).removeAttr("disabled");
            }
        }
    }

    /**
     * right items search handler
     */
    Transfer.prototype.right_items_search_handler = function () {
        var self = this;
        $(self.selectedItemSearcherId).keyup(function () {
            var transferDoubleSelectedListLis = self.$element.find(self.transferDoubleSelectedListLiClass);
            self.$element.find(self.transferDoubleSelectedListUlClass).css('display', 'block');

            let searchString = $(self.selectedItemSearcherId).val();

            if (searchString == "") {
                transferDoubleSelectedListLis.css('display', 'block');
                return;
            }

            transferDoubleSelectedListLis.css('display', 'none');

            for (var i = 0; i < transferDoubleSelectedListLis.length; i++) {
                if (transferDoubleSelectedListLis.eq(i).text().toLowerCase().indexOf(searchString) >= 0) {
                    transferDoubleSelectedListLis.eq(i).css('display', 'block');
                }
            }
        });
    }

    /**
     * generate item
     */
    Transfer.prototype.generate_item = function (id, index, value, labelText, dataError) {
        return '<li class="transfer-double-selected-list-li  transfer-double-selected-list-li-' + id + ' .clearfix">' +
            '<div class="checkbox-group">' +
            '<input type="checkbox" value="' + value + '" class="checkbox-normal checkbox-selected-item-' + id + '" id="selectedCheckbox_' + index + '_' + id + '">' +
            '<label data-error="' + dataError + '" class="checkbox-selected-name-' + id + '" for="selectedCheckbox_' + index + '_' + id + '">' +
            this.exclamationRectangle(dataError) +  labelText +
            '</label>' +
            '</div>' +
            '</li>';
    }

    /**
     * generate group item
     */
    Transfer.prototype.generate_group_item = function (id, groupIndex, itemIndex, value, labelText, dataError) {
        return '<li class="transfer-double-selected-list-li transfer-double-selected-list-li-' + id + ' .clearfix">' +
            '<div class="checkbox-group">' +
            '<input type="checkbox" value="' + value + '" class="checkbox-normal checkbox-selected-item-' + id + '" id="group_' + groupIndex + '_selectedCheckbox_' + itemIndex + '_' + id + '">' +
            '<label data-error="' + dataError + '" class="checkbox-selected-name-' + id + '" for="group_' + groupIndex + '_selectedCheckbox_' + itemIndex + '_' + id + '">' +
            this.exclamationRectangle(dataError) +  labelText +
            '</label>' +
            '</div>' +
            '</li>'
    }

    /**
     * apply callable
     */
    function applyCallable(transfer) {
        if (Object.prototype.toString.call(transfer.settings.callable) === "[object Function]") {
            var selected_items = get_selected_items(transfer);
            transfer.settings.callable.call(transfer, selected_items);
        }
    }

    /**
     * get selected items
     */
    function get_selected_items(transfer) {
        var selected = [];
        var transferDoubleSelectedListLiArray = transfer.$element.find(transfer.transferDoubleSelectedListLiClass);
        for (var i = 0; i < transferDoubleSelectedListLiArray.length; i++) {
            var checkboxGroup = transferDoubleSelectedListLiArray.eq(i).find(".checkbox-group");

            var item = {};
            item[transfer.settings.itemName] = checkboxGroup.find("label").text();
            item[transfer.settings.valueName] = checkboxGroup.find("input").val();
            selected.push(item);
        }
        return selected;
    }

    /**
     * get group items number
     * @param {Array} groupDataArray 
     * @param {string}  groupArrayName 
     */
    function get_group_items_num(groupDataArray, groupArrayName) {
        var group_item_total_num = 0;
        for (var i = 0; i < groupDataArray.length; i++) {
            var groupItemData = groupDataArray[i][groupArrayName];
            if (groupItemData && groupItemData.length > 0) {
                group_item_total_num = group_item_total_num + groupItemData.length;
            }
        }
        return group_item_total_num;
    }

    /**
     * get the total number by replacing the template
     * @param {*} template 
     * @param {*} total_num 
     */
    function get_total_num_text(template, total_num) {
        var _template = template;
        return _template.replace(/{total_num}/g, total_num);
    }

    /**
     * Inner Map
     */
    function InnerMap() {
        this.keys = new Array();
        this.values = new Object();

        this.put = function (key, value) {
            if (this.values[key] == null) {
                this.keys.push(key);
            }
            this.values[key] = value;
        }
        this.get = function (key) {
            return this.values[key];
        }
        this.remove = function (key) {
            for (var i = 0; i < this.keys.length; i++) {
                if (this.keys[i] === key) {
                    this.keys.splice(i, 1);
                }
            }
            delete this.values[key];
        }
        this.forEach = function (fn) {
            for (var i = 0; i < this.keys.length; i++) {
                var key = this.keys[i];
                var value = this.values[key];
                fn(key, value);
            }
        }
        this.isEmpty = function () {
            return this.keys.length == 0;
        }
        this.size = function () {
            return this.keys.length;
        }
    }

    /**
     * get id
     */
    function getId() {
        var counter = 0;
        return function (prefix) {
            var id = (+new Date()).toString(32),
                i = 0;
            for (; i < 5; i++) {
                id += Math.floor(Math.random() * 65535).toString(32);
            }
            return (prefix || '') + id + (counter++).toString(32);
        }
    }


    /*
        //some element selector and a click event...plain js works here too
        $("div").click(function() {
            //returns an object {before: true/false, after: true/false}
            psuedoClick(this);

            //returns true/false
            psuedoClick(this).before;

            //returns true/false
            psuedoClick(this).after;

        });
    */
    function psuedoClick(parentElem) {

        var beforeClicked,
            afterClicked;

        var parentLeft = parseInt(parentElem.getBoundingClientRect().left, 10),
            parentTop = parseInt(parentElem.getBoundingClientRect().top, 10);

        var parentWidth = parseInt(window.getComputedStyle(parentElem).width, 10),
            parentHeight = parseInt(window.getComputedStyle(parentElem).height, 10);

        var before = window.getComputedStyle(parentElem, ':before');

        var beforeStart = parentLeft + (parseInt(before.getPropertyValue("left"), 10)),
            beforeEnd = beforeStart + parseInt(before.width, 10);

        var beforeYStart = parentTop + (parseInt(before.getPropertyValue("top"), 10)),
            beforeYEnd = beforeYStart + parseInt(before.height, 10);

        var after = window.getComputedStyle(parentElem, ':after');

        var afterStart = parentLeft + (parseInt(after.getPropertyValue("left"), 10)),
            afterEnd = afterStart + parseInt(after.width, 10);

        var afterYStart = parentTop + (parseInt(after.getPropertyValue("top"), 10)),
            afterYEnd = afterYStart + parseInt(after.height, 10);

        var mouseX = event.clientX,
            mouseY = event.clientY;

        beforeClicked = (mouseX >= beforeStart && mouseX <= beforeEnd && mouseY >= beforeYStart && mouseY <= beforeYEnd ? true : false);

        afterClicked = (mouseX >= afterStart && mouseX <= afterEnd && mouseY >= afterYStart && mouseY <= afterYEnd ? true : false);

        return {
            "before": beforeClicked,
            "after": afterClicked

        };



    }

}(jQuery));