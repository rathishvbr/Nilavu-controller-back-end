import {observes} from 'ember-addons/ember-computed-decorators';
import FilterProperties from 'nilavu/models/filter-properties';
export default Ember.Component.extend({

    runningIP: "",
    visibleAlert: false,

    setIPS() {
        this.set('vnchost', FilterProperties.byKey(this.get('model.inputs'),"vnchost"));
        this.set('containerId', FilterProperties.byKey(this.get('model.inputs'),"instance_id"));
    },

    @observes('runningIP')validateIP() {
        if (!Em.isBlank(this.get('runningIP'))) {
            this.set("showNetworkSpinnerVisible", false);
            this.startRefreshing();
        }
    },

    @observes('selectedTab', 'visible')tabChanged() {
        if (Ember.isEqual(this.get('selectedTab'), "network") && this.get('visible')) {
            this.setIPS();
            this.set("showNetworkSpinnerVisible", true);
            this.validateVncHost();
        };
    },

    showAlert: function() {
        if (!this.get('visibleAlert')) {
            return "alert alert-danger contentDisable";
        } else {
            return "alert alert-danger contentVisible";
        }
    }.property('visibleAlert'),

    validateVncHost: function() {
        var self = this;
        if (!Em.isBlank(self.get('runningIP'))) {
            this.startRefreshing();
            return;
        }
        if (Em.isBlank(self.get('vnchost'))) {
            this.set("showCpuSpinnerVisible", false);
            this.set('visibleAlert', true);
            self.notificationMessages.error(I18n.t("app_management.container_ip_error"));
            return;
        }
        if (Em.isBlank(self.get('containerId'))) {
            this.set("showNetworkSpinnerVisible", false);
            this.set('visibleAlert', true);
            self.notificationMessages.error(I18n.t("app_management.container_ip_error"));
            return;
        }
        Nilavu.ajax("/metrics/docker", {
            type: 'GET',
            data: {
                ip: this.get("vnchost"),
                containerId: this.get("containerId")
            }
        }).then(function() {
            self.set("runningIP", self.get('vnchost'));
            return;
        }).catch(function() {
            this.set("showCpuSpinnerVisible", false);
            this.set('visibleAlert', true);
            self.notificationMessages.error(I18n.t("vm_management.network.connect_error"));
        });
    },

    showSpinner: function() {
        return this.get("showNetworkSpinnerVisible");
    }.property("showNetworkSpinnerVisible"),

    willDestroyElement: function() {
        this.set('refreshing', false);
    },

    startRefreshing: function() {
        this.set('refreshing', true);
        Em.run.later(this, this.refresh, 300);
    },

    refresh: function() {
        if (!Ember.isEqual(this.get('selectedTab'), "network"))
            return;
        this.getMetrics();
        this.set('visibleAlert', false);
        Em.run.later(this, this.refresh, 300);
    },

    getMetrics: function() {
        var _this = this;
        Nilavu.ajax("/metrics/docker", {
            type: 'GET',
            data: {
                ip: this.get("runningIP"),
                containerId: this.get("containerId")
            }
        }).then(function(result) {
            _this.set("showCpuSpinnerVisible", false);
            _this._drawChart(result);
            return;
        });
        return;
    },

    _drawChart: function(data) {
        var stats = data;
        var self = this;

        if (stats.spec.has_network && !this._hasResource(stats, "network")) {
            return;
        }
        if (stats.stats[0].network.interfaces.length < 0) {
            self.notificationMessages.error(I18n.t("vm_management.network.interface_error"));
            return;
        }
        var interfaceIndex = -1;
        if (stats.stats.length > 0) {
            interfaceIndex = this._getNetworkInterfaceIndex("eth0", stats.stats[0].network.interfaces);
            //interfaceIndex = this._getNetworkInterfaceIndex("eth1", stats.stats[0].network.interfaces);
        }
        if (interfaceIndex < 0) {
            self.notificationMessages.error(I18n.t("vm_management.network.interface_error"));
            return;
        }

        var titles = ["Time", "Tx bytes", "Rx bytes"];
        var data = [];
        for (let i = 1; i < stats.stats.length; i++) {
            var cur = stats.stats[i];
            var prev = stats.stats[i - 1];
            var intervalInSec = this._getInterval(cur.timestamp, prev.timestamp) / 1000000000;
            var elements = [];
            elements.push(cur.timestamp);
            elements.push((cur.network.interfaces[interfaceIndex].tx_bytes - prev.network.interfaces[interfaceIndex].tx_bytes) / intervalInSec);
            elements.push((cur.network.interfaces[interfaceIndex].rx_bytes - prev.network.interfaces[interfaceIndex].rx_bytes) / intervalInSec);
            data.push(elements);
        }

        var min = Infinity;
        var max = -Infinity;

        for (let i = 0; i < data.length; i++) {
            if (data[i] != null) {
                data[i][0] = new Date(data[i][0]);
            }

            for (var j = 1; j < data[i].length; j++) {
                var val = data[i][j];
                if (val < min) {
                    min = val;
                }
                if (val > max) {
                    max = val;
                }
            }
        }

        var minWindow = min - (max - min) / 15;
        if (minWindow < 0) {
            minWindow = 0;
        }
        var dataTable = new google.visualization.DataTable();

        dataTable.addColumn('datetime', titles[0]);
        for (var i = 1; i < titles.length; i++) {
            dataTable.addColumn('number', titles[i]);
        }
        dataTable.addRows(data);

        var opts = {
            curveType: 'function',
            height: 300,
            width: 1060,
            chartArea: {
                left: 110,
                top: 5
            },
            focusTarget: "category",
            vAxis: {
                title: "Bytes per Second",
                viewWindow: {
                    min: minWindow
                }
            },
            legend: {
                position: 'bottom'
            }
        };
        if (min === max) {
            opts.vAxis.viewWindow.max = 3.1 * max;
            opts.vAxis.viewWindow.min = 0.9 * max;
        }

        var chart = new google.visualization.LineChart(document.getElementById("chart-network"));
        chart.draw(dataTable, opts);

    },

    _hasResource: function(stats, resource) {
        return stats.stats.length > 0 && stats.stats[0][resource];
    },

    _getNetworkInterfaceIndex: function(interfaceName, interfaces) {
        for (var i = 0; i < interfaces.length; i++) {
            if (interfaces[i].name === interfaceName) {
                return i;
            }
        }
        return 0;
    },

    _getInterval: function(current, previous) {
      var curr = new Date(current);
      var prevv = new Date(previous);
        return (curr.getTime() - prevv.getTime()) * 1000000;
    }
});
