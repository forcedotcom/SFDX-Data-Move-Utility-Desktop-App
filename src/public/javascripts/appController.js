/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */


var app = angular.module("sfdmuGuiApp", []);

app.directive('transferPicker', function($timeout, $compile, $rootScope) {

    return {

        link: function($scope, $element, $attrs) {
            var oldtemsCount = 0;
            var ngModel = $element.attr('data-model');
            var ngCollection = $element.attr('data-collection');
            var groupBy = $element.attr("group-by");
            var catName = "category";
            var dataCatName = "categoryData";
            var onItemChanged = $element.attr('on-item-changed');
            if ($scope.$parent[onItemChanged]) {
                onItemChanged = $scope.$parent[onItemChanged];
            }

            if (!$element.attr("data-transfer-picker")) {
                $element.attr("data-transfer-picker", "true");
                var itemName = $element.attr("item-name");
                var valueName = $element.attr("value-name");
                var leftTabNameText = $element.attr("left-tab-name-text");
                var rightTabNameText = $element.attr("right-tab-name-text");
                var searchPlaceholderText = $element.attr("search-placeholder-text");
                var id = $scope.$eval($element.attr("data-id"));

                var settings = {
                    "groupDataArray": [],
                    "groupItemName": catName,
                    "groupArrayName": dataCatName,
                    "itemName": itemName,
                    "valueName": valueName,
                    "leftTabNameText": leftTabNameText,
                    "rightTabNameText": rightTabNameText,
                    "searchPlaceholderText": searchPlaceholderText
                };
            }

            $scope.$watch(ngModel, function() {
                var items = getDeep($scope, ngCollection) || [];
                oldtemsCount = items.length;
                if (items.length == 0) return;
                var selectedItems = getDeep($scope, ngModel) || [];
                items.forEach(function(item) {
                    var it = selectedItems.filter(function(x) {
                        return x[valueName] == item[valueName];
                    });
                    item.selected = it.length > 0;
                });
                settings.groupDataArray = groupBy2(items, groupBy, catName, dataCatName);
                $("#" + id).empty();
                $("#" + id).transfer(settings);
            }, true);

            $scope.$watch(ngCollection, function() {
                oldtemsCount = 0;
                var items = getDeep($scope, ngCollection) || [];
                if (items.length == 0) return;
                settings.groupDataArray = groupBy2(items, groupBy, catName, dataCatName);
                settings.callable = function(items) {
                    $timeout(function() {
                        var i = [].concat(items);
                        setDeep($scope, ngModel, i);
                        if (onItemChanged) {
                            if (oldtemsCount != i.length) {
                                oldtemsCount = i.length
                                onItemChanged($scope.object, items);
                            }
                        }
                        _refreshTootips();
                    });
                }
                $("#" + id).empty();
                $("#" + id).transfer(settings);
            }, true);

        },
        restrict: "EACM"
    }

});

app.directive('selectPicker', function($timeout) {

    return {

        link: function($scope, $element) {

            var ngModel = $element.attr('data-model');
            var ngCollection = $element.attr('data-collection');
            var onchange = $element.attr('data-onchange');

            if (!$element.attr("data-select-picker")) {
                $element.attr("data-select-picker", "true");
                $element.attr("multiple", "true");
                $element.attr('data-live-search', 'true');
                $element.attr('data-selected-text-format', 'count > 3');
                $element.attr('data-live-search-placeholder', "Search...");
                var modelValue = getDeep($scope, ngModel) || [];
                $element.prop('old-value', modelValue);

                if ($element.attr("data-multiple") == "true") {
                    $element.attr("data-actions-box", "true");
                } else {
                    $element.attr("data-max-options", "1");
                }
                $element.on('changed.bs.select', function(e) {
                    $scope.$apply(function() {
                        var val = [];
                        for (opt of e.target.selectedOptions) {
                            val.push(opt.value);
                        }
                        val = [].concat(val);
                        setDeep($scope, ngModel, val);
                        var oldValue = $element.prop('old-value');
                        if (onchange && !oldValue.equals(val)) {
                            $scope[onchange]();
                            $element.prop('old-value', val);
                        }
                    });
                });
            }

            $scope.$watch(ngModel, function() {
                $timeout(function() {
                    var modelValue = getDeep($scope, ngModel);
                    $element.selectpicker('val', modelValue);
                });
            }, true);

            $scope.$watch(ngCollection, function() {
                // Sorting:
                $timeout(function() {
                    $element.selectpicker('refresh');
                });
            }, true);

        },
        restrict: "EACM"
    }
});

app.config(['$qProvider', function($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);


app.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('{[{');
    $interpolateProvider.endSymbol('}]}');
});

app.provider('$copyToClipboard', [function() {

    this.$get = ['$q', '$window', function($q, $window) {
        var body = angular.element($window.document.body);
        var textarea = angular.element('<textarea/>');
        textarea.css({
            position: 'fixed',
            opacity: '0'
        });
        return {
            copy: function(stringToCopy) {
                var deferred = $q.defer();
                deferred.notify("copying the text to clipboard");
                textarea.val(stringToCopy);
                body.append(textarea);
                textarea[0].select();

                try {
                    var successful = $window.document.execCommand('copy');
                    if (!successful) throw successful;
                    deferred.resolve(successful);
                } catch (err) {
                    deferred.reject(err);
                } finally {
                    textarea.remove();
                }
                return deferred.promise;
            }
        };
    }];
}]);


app.run(function($rootScope) {
    // TODO:
});


function _refreshTootips() {
    $('[data-toggle="tooltip"]').tooltip('dispose');
    $('[data-toggle="tooltip"]').tooltip();
}

app.controller("appController", ['$copyToClipboard', '$scope', '$rootScope', '$http', '$timeout', '$window', '$q', function($copyToClipboard, $scope, $rootScope, $http, $timeout, $window, $q) {

    // INIT -------------------------------------------
    $scope.init = function() {

        // Setup context
        $scope.context = {

            initScopeSections: {},

            sourceOrg: undefined,
            targetOrg: undefined,

            orgList: [],
            orgSelector: {
                sourceOrgIds: [],
                targetOrgIds: []
            },

            configList: [],
            selectedConfigIds: [],
            selectedConfig: {},

            objectList: [],
            objects: [],

            configExtraData: {},

            isPackageExecuted: false,

            loaderMessage: "Working. Please wait...",

            loaderButtonMessage: "Abort",

            showLoaderButton: false


        };

        // Setup toasts
        $('.toast-alert').toast({
            animation: true,
            autohide: true,
            delay: 3000
        });

        $('.toast-progress').toast({
            animation: true,
            autohide: false
        });

        // Ajax loader
        (function() {
            var origOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function() {
                $('.ajax-load-message').removeClass('hidden');
                $('.ajax-loader').removeClass('hidden');
                $('.ajax-loader').addClass('shown');
                this.addEventListener('load', function() {
                    $('.ajax-load-message').addClass('hidden');
                    $('.ajax-loader').addClass('hidden');
                    $('.ajax-loader').removeClass('shown');
                });
                origOpen.apply(this, arguments);
            };
        })();

        // Whatchers
        $scope.$watchCollection("context.selectedConfigIds", $scope.configChangedHandler);

        // Setup UI
        refreshUI();

    }



    function _refreshUI(accordion) {

        _refreshTootips();

        $("#menu-toggle").off('click').on('click', function(e) {
            e.preventDefault();
            $("#wrapper").toggleClass("toggled");
        });

        if (accordion) {

            $('.accordion').collapse();
            $('.accordion > .card .collapse').collapse("hide");

            $('.accordion').off('show.bs.collapse').on('show.bs.collapse', function(event) {
                var handler = $scope[$(event.currentTarget).attr('data-event-handler')];
                var $tab = $(event.target);
                var id = $tab.attr('id');
                if (handler) {
                    handler(event, id, $tab, $tab.prev('.card-header'));
                }
            });
        }
    }

    function refreshUI(accordion) {

        accordion = typeof accordion == 'undefined' ? true : accordion;

        $timeout(function() {

            _refreshUI(accordion);

        }, 500);

    }



    // LOGIN / REGISTER PAGES -------------------------------------------
    $scope.login = function() {
        $scope.errorMessage = "";
        postFormAsync('/login/signin').catch(function(error) {
            $timeout(function() {
                $scope.errorMessage = error;
            }, 100);
        });
    }

    $scope.register = function() {
        $scope.errorMessage = "";
        postFormAsync('/register/new').catch(function(error) {
            $timeout(function() {
                $scope.errorMessage = error;
            }, 100);

        });
    }



    //CONNECTION SECTION -------------------------------------------
    $scope.initConnectionSection = function() {

        postJsonAsync("/orglist").then(function(response) {
            $scope.context.orgList = response.data.orgList;
            $scope.context.orgSelector.sourceOrgIds = [$scope.context.orgList[0].value];
            $scope.context.orgSelector.targetOrgIds = [$scope.context.orgList[0].value];
        }).catch(function() {});

        $scope.envList = [{
                value: "test",
                text: "Sandbox"
            },
            {
                value: "dev",
                text: "Development"
            },
            {
                value: "prod",
                text: "Production"
            }
        ];

    }

    $scope.addOrg = function() {
        $scope.errorMessage = "";
        $scope.successMessage = "";
        showProgress("Connecting to the salesforce organization...", "Connecting in progress...", "Abort");
        postFormAsync('/addorg', "#addConnectionForm").then(function(response) {
            $scope.$apply(function() {
                $scope.context.orgList = response.data.orgList;
                $scope.context.orgSelector.sourceOrgIds = [response.data.selectedOrgId];
                $scope.context.orgSelector.targetOrgIds = [response.data.selectedOrgId];
                $scope.successMessage = "The connection was successfully added or updated.";
            });
            $('.input').val('');
            showToast("The connection was successfully added or updated.");
        }).catch(function() {
            $scope.$apply(function() {
                $scope.errorMessage = "Adding or updating of connection is failed or aborted. Please, try again.";
            });
        });
    }




    $scope.removeOrgClickHandler = function() {
        var name = $scope.context.orgList.filter(function(org) {
            return org.value == $scope.context.orgSelector.targetOrgIds[0];
        })[0].text;
        confirmAsync("Are you sure you want to remove connection to the organization " + name + "?", "Edit Salesforce organization list").then(function(confirmed) {
            if (confirmed) {
                showProgress("Removing the Org...");
                $timeout(function() {
                    postJsonAsync('/removeorg', {
                        id: $scope.context.orgSelector.targetOrgIds[0]
                    }).then(function(response) {
                        $scope.$apply(function() {
                            $scope.context.orgList = response.data.orgList;
                            $scope.context.orgSelector.sourceOrgIds = [response.data.selectedOrgId];
                            $scope.context.orgSelector.targetOrgIds = [response.data.selectedOrgId];
                        });
                        showToast("Org was successfully removed.");

                    }).catch(function() {});
                }, 500);
            }
        });

    }

    $scope.connectBetweenOrgsClickHandler = function() {

        showProgress("Connecting and reading global metadata... It may take a while...");

        $timeout(function() {

            var sourceId = $scope.context.orgList.filter(function(org) {
                return org.value == $scope.context.orgSelector.sourceOrgIds[0];
            })[0].value;

            var targetId = $scope.context.orgList.filter(function(org) {
                return org.value == $scope.context.orgSelector.targetOrgIds[0];
            })[0].value;

            postJsonAsync('/connectorgs', {
                sourceId,
                targetId
            }).then(function(response) {


                $scope.initPackageConfigurationSection(response.data);
                $scope.configChangedHandler();
                $('a[href="#config"]').tab('show');

            }).catch(function() {});

        }, 500);
    }


    // PACKAGE CONFIGURATION SECTION --------------------------
    $scope.initPackageConfigurationSection = function(initData) {

        // Initiailization general ------------
        $scope.context.sourceOrg = undefined;
        $scope.context.targetOrg = undefined;

        if (!$scope.context.initScopeSections.packageConfig) {
            $scope.context.initScopeSections.packageConfig = true;
            return;
        }

        // Setup variables ----------
        $scope.context.sourceOrg = initData.sourceOrg;
        $scope.context.targetOrg = initData.targetOrg;

        $scope.context.configList = initData.configList;
        $scope.context.selectedConfigIds = [initData.selectedConfigId];

        $scope.context.objectList = [];
        $scope.context.objects = [];
        $scope.context.configExtraData = {};

        refreshUI();

    }

    $scope.addConfigClickHandler = function() {
        promptAsync("Enter the name of the new configuration", "Edit configuration list").then(function(name) {
            if (!name) {
                return;
            }
            showProgress("Adding Config...");
            $timeout(function() {
                postJsonAsync('/addconfig', {
                    name: name
                }).then(function(response) {
                    $scope.$apply(function() {
                        $scope.context.configList = response.data.configList;
                        $scope.context.selectedConfigIds = [response.data.selectedConfigId];
                    });
                }).catch(function() {});
            }, 500);
        });
    }

    $scope.uploadConfigChangeHandler = function(e) {
        readSingleFile(e).then(function(json) {
            showProgress("Adding Config...");
            $timeout(function() {
                if (json) {
                    postJsonAsync('/addconfigfromfile', {
                        json: json
                    }).then(function(response) {
                        $scope.$apply(function() {
                            $scope.context.configList = response.data.configList;
                            $scope.context.selectedConfigIds = [response.data.selectedConfigId];
                            $('#uploadConfig').val('');
                        });
                    }).catch(function() {});
                }
            }, 500);
        });
    }


    $scope.removeConfigClickHandler = function() {

        var name = $scope.context.configList.filter(function(config) {
            return config.value == $scope.context.selectedConfigIds[0];
        })[0].text;

        confirmAsync("Are you sure you want to remove configuration " + name + "?", "Edit configuration list").then(function(confirmed) {
            if (confirmed) {
                $scope.context.selectedConfig.dataError = "";
                showProgress("Removing the Config...");
                $timeout(function() {
                    postJsonAsync('/removeconfig', {
                        id: $scope.context.selectedConfigIds[0]
                    }).then(function(response) {
                        $scope.$apply(function() {
                            $scope.context.configList = response.data.configList;
                            $scope.context.selectedConfigIds = [response.data.selectedConfigId];
                        });
                    }).catch(function() {});
                }, 500);
            }
        });
    }


    $scope.cloneConfigClickHandler = function() {

        var name = $scope.context.configList.filter(function(config) {
            return config.value == $scope.context.selectedConfigIds[0];
        })[0].text;

        promptAsync("Enter the name of the new configuration", "Edit configuration list", name).then(function(name) {
            if (name) {
                showProgress("Cloning Config...");
                $timeout(function() {
                    postJsonAsync('/cloneconfig', {
                        id: $scope.context.selectedConfigIds[0],
                        name: name
                    }).then(function(response) {
                        $scope.$apply(function() {
                            $scope.context.configList = response.data.configList;
                            $scope.context.selectedConfigIds = [response.data.selectedConfigId];
                        });
                    }).catch(function() {});
                }, 500);
            }

        });


    }



    $scope.editConfigClickHandler = function() {
        var name = $scope.context.configList.filter(function(config) {
            return config.value == $scope.context.selectedConfigIds[0];
        })[0].text;

        promptAsync("Enter the new name of the configuration", "Edit configuration", name).then(function(name) {
            if (name) {
                showProgress("Editing Config...");
                $timeout(function() {
                    postJsonAsync('/editconfig', {
                        id: $scope.context.selectedConfigIds[0],
                        name: name
                    }).then(function(response) {
                        $scope.$apply(function() {
                            $scope.context.configList = response.data.configList;
                            $scope.context.selectedConfigIds = [response.data.selectedConfigId];
                        });
                    }).catch(function() {});
                }, 500);
            }
        });
    }



    // -----------------------------------------------------
    // --------------- OBJECTS SECTION -----------------------
    // -----------------------------------------------------

    $scope.configChangedHandler = function() {

        if ($scope.context.selectedConfigIds[0]) {

            // Retrieve full config data
            postJsonAsync('/getconfigdata', {
                id: $scope.context.selectedConfigIds[0]
            }).then(function(response) {
                $scope.$apply(function() {
                    $scope.context.selectedConfig = $scope.context.configList.filter(function(x) {
                        return x.value == $scope.context.selectedConfigIds[0]
                    })[0];

                    $scope.context.objectList = response.data.objectList;
                    $scope.context.selectedObjectIds = [response.data.selectedObjectId];
                    $scope.context.objects = response.data.objects;
                    $scope.context.objects.forEach(function(o) {
                        o._id = makeid(10);
                        o.extraData = JSON.parse(o.serializedObjectExtraData);
                    });
                    $scope.context.selectedConfig.dataError = response.data.configDataError;
                    $scope.context.selectedConfig.extraData = JSON.parse(response.data.resultString);
                });

                refreshUI();

            }).catch(function() {});

        }

    }

    $scope.switchConnectionDirection = function() {

        if ($scope.context.selectedConfigIds[0]) {
            // Retrieve full config data
            postJsonAsync('/switchconnectiondirection', {
                id: $scope.context.selectedConfigIds[0]
            }).then(function(response) {
                $scope.$apply(function() {
                    $scope.context.selectedConfig = $scope.context.configList.filter(function(x) {
                        return x.value == $scope.context.selectedConfigIds[0]
                    })[0];

                    $scope.context.objectList = response.data.objectList;
                    $scope.context.selectedObjectIds = [response.data.selectedObjectId];
                    $scope.context.objects = response.data.objects;
                    $scope.context.objects.forEach(function(o) {
                        o._id = makeid(10);
                        o.extraData = JSON.parse(o.serializedObjectExtraData);
                    });
                    $scope.context.selectedConfig.dataError = response.data.configDataError;
                    $scope.context.selectedConfig.extraData = JSON.parse(response.data.resultString);
                });

                refreshUI();

            }).catch(function() {});

        }
    }



    $scope.addObjectClickHandler = function() {

        if ($scope.context.selectedObjectIds[0]) {
            showProgress("Adding objects...");
            $timeout(function() {
                postJsonAsync('/addobjects', {
                    names: $scope.context.selectedObjectIds
                }).then(function(response) {

                    $scope.$apply(function() {
                        $scope.context.objectList = response.data.objectList;
                        $scope.context.selectedObjectIds = [response.data.selectedObjectId];
                        $scope.context.objects = response.data.objects;
                        $scope.context.objects.forEach(function(o) {
                            o._id = makeid(10);
                            o.extraData = JSON.parse(o.serializedObjectExtraData);
                        });
                        $scope.context.selectedConfig.dataError = response.data.configDataError;
                    });

                    refreshUI();

                }).catch(function() {});
            }, 500);

        }

    }


    $scope.addRelatedObjectsClickHandler = function() {
        confirmAsync("Are you sure you want to add all related sObjects to the current configuration", "Edit configuration").then(function(confirmed) {
            if (confirmed) {
                showProgress("Adding related objects...");
                $timeout(function() {
                    postJsonAsync('/addrelatedobjects', {}).then(function(response) {

                        $scope.$apply(function() {
                            $scope.context.objectList = response.data.objectList;
                            $scope.context.selectedObjectIds = [response.data.selectedObjectId];
                            $scope.context.objects = response.data.objects;
                            $scope.context.objects.forEach(function(o) {
                                o._id = makeid(10);
                                o.extraData = JSON.parse(o.serializedObjectExtraData);
                            });
                            $scope.context.selectedConfig.dataError = response.data.configDataError;
                        });

                        refreshUI();

                    }).catch(function() {});
                }, 500);
            }
        });
    }


    $scope.removeObjectClickHandler = function(objectName) {
        confirmAsync("Are you sure you want to remove " + objectName + "?", "Edit configuration").then(function(confirmed) {
            if (confirmed) {
                showProgress("Removing object...");
                $timeout(function() {
                    postJsonAsync('/removeobject', {
                        name: objectName
                    }).then(function(response) {

                        $scope.$apply(function() {
                            $scope.context.objectList = response.data.objectList;
                            $scope.context.selectedObjectIds = [response.data.selectedObjectId];
                            $scope.context.objects = response.data.objects;
                            $scope.context.objects.forEach(function(o) {
                                o._id = makeid(10);
                                o.extraData = JSON.parse(o.serializedObjectExtraData);
                            });
                            $scope.context.selectedConfig.dataError = response.data.configDataError;
                        });

                        refreshUI();

                    }).catch(function() {});
                }, 500);
            }
        });

    }


    $scope.loadObjectConfigurationFromCSVFileClickHandler = function(objectName) {

        var object = $scope.context.objects.filter(function(x) {
            return x.value == objectName;
        })[0];

        confirmAsync("Are you sure you want to update configuration of the " + objectName + " from the CSV file?", "Update object").then(function(confirmed) {
            if (confirmed) {
                showProgress("Updating object...");
                $timeout(function() {
                    postJsonAsync('/updateobjectfromcsv', {
                        name: objectName
                    }).then(function(response) {

                        $scope.$apply(function() {
                            object.sourceFields = response.data.object.sourceFields;
                            object.fields = response.data.object.fields;
                            object.extraData = JSON.parse(response.data.resultString);
                            $scope.context.selectedConfig.dataError = response.data.configDataError;
                            object.dataError = response.data.object.dataError;
                        });

                        refreshUI(false);

                    }).catch(function() {});
                }, 500);
            }
        });

    }

    $scope.loadConfigurationFromCSVFileClickHandler = function() {

        var name = $scope.context.configList.filter(function(config) {
            return config.value == $scope.context.selectedConfigIds[0];
        })[0].text;

        confirmAsync("Are you sure you want to load list of sObjects in " + name + " from the CSV files?", "Edit configuration").then(function(confirmed) {
            if (confirmed) {
                $scope.context.selectedConfig.dataError = "";
                showProgress("Update the Config...");
                $timeout(function() {
                    postJsonAsync('/replaceconfigfromcsv', {
                        id: $scope.context.selectedConfigIds[0]
                    }).then(function(response) {
                        $scope.$apply(function() {
                            $scope.context.selectedConfig = $scope.context.configList.filter(function(x) {
                                return x.value == $scope.context.selectedConfigIds[0]
                            })[0];

                            $scope.context.objectList = response.data.objectList;
                            $scope.context.selectedObjectIds = [response.data.selectedObjectId];
                            $scope.context.objects = response.data.objects;
                            $scope.context.objects.forEach(function(o) {
                                o._id = makeid(10);
                                o.extraData = JSON.parse(o.serializedObjectExtraData);
                            });
                            $scope.context.selectedConfig.dataError = response.data.configDataError;
                            $scope.context.selectedConfig.extraData = JSON.parse(response.data.resultString);
                        });

                        refreshUI();
                    }).catch(function() {});
                }, 500);
            }
        });
    }


    $scope.showObjectDetailsHandler = function(event, tabId, $tabBody, $tabHeader) {

        var object = $scope.context.objects.filter(function(x) {
            return x.id == tabId;
        })[0];

        //if (object.fields.length == 0) {
        showProgress("Getting object data...");
        $timeout(function() {
            postJsonAsync('/getobject', {
                name: object.value
            }).then(function(response) {

                $scope.$apply(function() {
                    blockEvents = true;
                    object.sourceFields = response.data.object.sourceFields;
                    object.fields = response.data.object.fields;
                    object.dataError = response.data.object.dataError;
                    object.extraData = JSON.parse(response.data.object.serializedObjectExtraData);
                    object.paramsVisibility = {};
                    object.paramsOldValues = {};

                    $scope.context.selectedConfig.dataError = response.data.configDataError;
                    setTimeout(function() {
                        blockEvents = false;
                    }, 2000);
                });

                refreshUI(false);

            }).catch(function() {});
        }, 500);

        //}
    }

    $scope.showParamEditorField = function(object, field) {
        object.paramsVisibility[field] = true;
        if (Array.isArray(object.extraData[field])) {
            object.paramsOldValues[field] = [].concat(object.extraData[field]);
        } else {
            object.paramsOldValues[field] = object.extraData[field];
        }

        if (field == "mockFields") {
            $scope.showParamEditorField(object, "availableFieldsForMocking");
        }
    }

    $scope.updateParamEditorField = function(object, field) {
        object.paramsVisibility[field] = false;
        $scope.updateObjectParameters(object);
    }

    $scope.cancelUpdateParamEditorField = function(object, field) {
        object.paramsVisibility[field] = false;
        if (Array.isArray(object.extraData[field])) {
            object.extraData[field] = [].concat(object.paramsOldValues[field]);
        } else {
            object.extraData[field] = object.paramsOldValues[field];
        }

        if (field == "mockFields") {
            $scope.cancelUpdateParamEditorField(object, "availableFieldsForMocking");
        }
    }


    blockEvents = false;
    $scope.addRemoveObjectFieldsHandler = function(object, selectedFields) {
        if (blockEvents) return;
        var fields = selectedFields.map(function(f) {
            return f.value;
        });
        showProgress("Updating fields...");
        $timeout(function() {
            postJsonAsync('/updatefields', {
                name: object.value,
                fields: fields
            }).then(function(response) {

                $scope.$apply(function() {
                    object.extraData = JSON.parse(response.data.resultString);
                    $scope.context.selectedConfig.dataError = response.data.configDataError;
                    object.dataError = response.data.object.dataError;
                });

                refreshUI(false);

            }).catch(function() {});
        }, 500);
    }


    $scope.updateObjectParameters = function(object) {
        showProgress("Updating parameters...");
        $timeout(function() {
            postJsonAsync('/updateobjectparameters', {
                name: object.value,
                extraData: JSON.stringify(object.extraData)
            }).then(function(response) {


                $scope.$apply(function() {
                    object.extraData = JSON.parse(response.data.resultString);
                    $scope.context.selectedConfig.dataError = response.data.configDataError;
                });
                refreshUI(false);

            }).catch(function() {});
        }, 500);

    }

    $scope.appendMockField = function(object) {
        var value = $(event.target).closest('.input-group').find('select').val();
        if (value) {
            object.extraData.mockFields.push({
                name: value,
                pattern: "name"
            });
            object.extraData.availableFieldsForMocking = object.extraData.availableFieldsForMocking
                .filter(function(x) {
                    return x.value != value;
                });
        }
    }


    $scope.removeMockField = function(object) {
        var value = $(event.target).attr('data-name');
        object.extraData.mockFields = object.extraData.mockFields.filter(function(x) {
            return x.name != value;
        });
        var v = object.fields.filter(function(x) {
            return x.value == value;
        })[0];
        object.extraData.availableFieldsForMocking.push({
            value: v.value,
            label: v.text
        });
    }




    $scope.createPackageScriptClickHandler = function() {
        _validatePackage().then(function(isValid) {
            $scope.context.selectedConfig.validated = true;
            if (isValid) {
                $timeout(function() {
                    postJsonAsync('/createpackagescript', {}).then(function(response) {

                        $scope.$apply(function() {
                            $scope.context.selectedConfig.dataError = response.data.configDataError;
                            $scope.context.configExtraData = JSON.parse(response.data.resultString);
                            $('a[href="#overview"]').tab('show');
                        });

                        refreshUI(false);

                    }).catch(function() {});
                }, 500);
            }
        });
    }



    $scope.updatePackageScriptHandler = function() {
        $timeout(function() {
            var data = Object.assign({}, $scope.context.configExtraData);
            delete data.scriptJSON;
            postJsonAsync('/createpackagescript', {
                extraData: JSON.stringify($scope.context.configExtraData)
            }).then(function(response) {

                $scope.$apply(function() {
                    $scope.context.selectedConfig.dataError = response.data.configDataError;
                    $scope.context.configExtraData = JSON.parse(response.data.resultString);
                });

                refreshUI(false);

            }).catch(function() {});
        }, 500);
    }



    function _validatePackage() {

        var deferred = $q.defer();

        showProgress("Validation of the package in progress...");

        $timeout(function() {
            postJsonAsync('/validatepackage', {}).then(function(response) {


                $scope.$apply(function() {
                    $scope.context.selectedConfig.dataError = response.data.configDataError;
                });
                refreshUI(false);
                deferred.resolve(!$scope.context.selectedConfig.dataError);

            }).catch(function() { deferred.resolve(false); });
        }, 500);

        return deferred.promise;

    }


    $scope.initReviewScriptSection = function() {

    }

    $scope.openExportFolder = function() {
        postJsonAsync('/openexportfolder', {});
    }

    $scope.openRootExportFolder = function() {
        postJsonAsync('/openrootexportfolder', {});
    }


    $scope.downloadScript = function() {
        getJsonAsync('/downloadscript', {});
    }


    $scope.copyCommandToClipboard = function() {
        if ($scope.context.configExtraData) {
            $copyToClipboard.copy($scope.context.configExtraData.commandString).then(function() {
                alertAsync('Copied');
            });
        }
    }


    $scope.initExecuteScriptSection = function() {}


    $scope.executePackage = async function() {
        $scope.context.isPackageExecuted = false;
        $('.execution-log').empty();
        let command = $scope.context.configExtraData.commandString;
        if (command) {
            $('a[href="#execute"]').tab('show');
            $scope.context.isPackageExecuted = true;
            await nodeUtils.callSfdxInConsoleAsync(command, '.execution-log');
            $timeout(function() {
                $scope.context.isPackageExecuted = false;
            }, 100);

        }
    }


    $scope.abortExecutePackage = function() {
        if ($scope.context.isPackageExecuted) {
            confirmAsync("Are you sure to abort the package execution?").then(function(confirmed) {
                if (confirmed) {
                    nodeUtils.killSfdxInConsoleProcess();
                    $scope.$apply(function() {
                        $scope.context.isPackageExecuted = false;
                    });
                    alertAsync('Aborted!');
                }
            });
        }
    }

    $scope.killConsoleCommand = function() {
        postJsonAsync('/killconsolecommand', {});
    }


    $scope.openUrl = function(url) {
        postJsonAsync('/openurl', {
            url: url
        });
    }



    // ---------------------------------
    // ---------------------------------
    // ---------------------------------
    // ---------------------------------
    // ---------------------------------
    // COMMON --------------------------
    // ---------------------------------
    // ---------------------------------
    // ---------------------------------
    // ---------------------------------
    // ---------------------------------
    function getJsonAsync(url, json) {
        var query = objectToQuerystring(json);
        return ajaxJsonAsync(url + query, undefined, "GET");
    }

    function postJsonAsync(url, json) {
        return ajaxJsonAsync(url, json, "POST");
    }

    function ajaxJsonAsync(url, json, method) {
        var dfd = jQuery.Deferred();
        $http({
            method: method,
            url: url,
            data: json,
            timeout: 1000 * 60 * 10
        }).then(function(response) {
            if (response.data.redirect) {
                window.location.href = response.data.redirect;
            } else {
                showProgress();
                if (response.data.error) {
                    showToast(response.data.error, true);
                    dfd.reject(response.data.error);
                } else {
                    dfd.resolve(response);
                }
            }
        }, function(error) {
            $timeout(function() {
                showProgress();
                showToast("Unexpected error. Check your internet connection.", true);
            });
            dfd.reject(error);
        });
        return dfd.promise();
    }

    function postFormAsync(url, formSelector) {
        return postJsonAsync(url, $(formSelector || 'form').formToJSON());
    }

    function alertAsync(message) {
        var dfd = jQuery.Deferred();
        bootbox.alert({
            message,
            backdrop: true,
            callback: function() {
                dfd.resolve(true);
            }
        });
        return dfd.promise();
    }

    function promptAsync(message, title, defaultValue) {
        title = title || "Enter value";
        var dfd = jQuery.Deferred();
        bootbox.prompt({
            title,
            message,
            value: defaultValue,
            backdrop: true,
            callback: function(value) {
                if (value == null)
                    dfd.resolve(undefined);
                else
                    dfd.resolve(value);
            }
        });
        return dfd.promise();
    }

    function confirmAsync(message, title) {
        message = message || "Are you sure?";
        title = title || "Action confirmation";
        var dfd = jQuery.Deferred();
        bootbox.confirm({
            title,
            message,
            backdrop: true,
            callback: function(result) {
                if (result != "")
                    dfd.resolve(true);
                else
                    dfd.resolve(undefined);
            }
        });
        return dfd.promise();
    }

    function showToast(toastMessage, isDanger) {
        $('.toast-progress').toast('hide');
        if (isDanger) {
            $('.toast-danger .toast-body').html(toastMessage);
            $('.toast-danger').toast('show');
        } else {
            $('.toast-success .toast-body').html(toastMessage);
            $('.toast-success').toast('show');
        }
    }

    function showProgress(toastMessage, loaderMessage, loaderButtonMessage) {
        $('.toast-danger').toast('hide');
        $('.toast-success').toast('hide');
        if (toastMessage) {
            $('.toast-progress .message').html(toastMessage);
            $('.toast-progress').toast('show');
            $('.ajax-loader').removeClass('hidden');

            if (loaderMessage) {
                $scope.context.loaderMessage = loaderMessage;
            }
            if (loaderButtonMessage) {
                $scope.context.loaderButtonMessage = loaderButtonMessage;
                $scope.context.showLoaderButton = true;
            } else {
                $scope.context.showLoaderButton = false;
            }

        } else {
            $('.toast-progress').toast('hide');
            $('.toast-progress .message').html("");
            $('.ajax-loader').addClass('hidden');
            $scope.context.showLoaderButton = false;
        }
    }


}]);