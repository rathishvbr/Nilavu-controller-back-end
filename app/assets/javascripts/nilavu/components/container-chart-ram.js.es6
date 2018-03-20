import {observes} from 'ember-addons/ember-computed-decorators';
import FilterProperties from 'nilavu/models/filter-properties';
export default Ember.Component.extend({

    runningIP: "",
    containerId: "",

    setIPS() {
      this.set('vnchost', FilterProperties.byKey(this.get('model.inputs'),"vnchost"));
      this.set('containerId', FilterProperties.byKey(this.get('model.inputs'),"instance_id"));
    },

    @observes('runningIP')validateIP() {
        if (!Em.isBlank(this.get('runningIP'))) {
            this.set("showNetworkSpinnerVisible", false);
            this.getcontainerInfo();
            this.startRefreshing();
        }
    },

    willDestroyElement: function() {
        this.set('refreshing', false);
    },

    startRefreshing: function() {
        this.set('refreshing', true);
        Em.run.later(this, this.refresh, 300);
    },

    @observes('selectedTab')tabChanged() {
        if (Ember.isEqual(this.get('selectedTab'), "ram")) {
            this.setIPS();
            this.set("showNetworkSpinnerVisible", true);
            this.validateVncHost();
        };
    },

    validateVncHost: function() {
        var self = this;
        if (!Em.isBlank(self.get('runningIP'))) {
            this.startRefreshing();
            return;
        }
        if (Em.isBlank(self.get('vnchost'))) {
            this.set("showNetworkSpinnerVisible", false);
            self.notificationMessages.error(I18n.t("app_management.container_ip_error"));
            return;
        }
        if (Em.isBlank(self.get('containerId'))) {
            this.set("showNetworkSpinnerVisible", false);
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
            this.set("showNetworkSpinnerVisible", false);
            self.notificationMessages.error(I18n.t("vm_management.network.connect_error"));
        });
    },

    showSpinner: function() {
        return this.get("showNetworkSpinnerVisible");
    }.property("showNetworkSpinnerVisible"),

    refresh: function() {
        if (!Ember.isEqual(this.get('selectedTab'), "ram"))
            return;
        this.getMetrics();
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
        }).then(function(stats) {
            _this.set("showNetworkSpinnerVisible", false);
            _this._drawChart(stats);
            return;
        });
        return;
    },

    getcontainerInfo() {
        var _this = this;
        Nilavu.ajax("/metrics/docker", {
            type: 'GET',
            data: {
                ip: this.get("runningIP"),
                containerId: this.get("containerId")
            }
        }).then(function(containerInfo) {
            _this.set("showNetworkSpinnerVisible", false);
            _this.set('containerInfo', containerInfo);
            return;
        });
    },

    _drawChart: function(stats) {
        var stats = stats;
        var containerInfo = this.get('containerInfo');

        var titles = ["Time", "Total", "Hot"];
        var data = [];
        for (let i = 1; i < stats.stats.length; i++) {
            var cur = stats.stats[i];
            var oneMegabyte = 1024 * 1024;
            var elements = [];
            elements.push(cur.timestamp);
            elements.push(cur.memory.usage / oneMegabyte);
            elements.push(cur.memory.working_set / oneMegabyte);
            data.push(elements);
        }
        var memory_limit = containerInfo.memory_capacity;
        if (stats.spec.memory.limit && (stats.spec.memory.limit < memory_limit)) {
            memory_limit = stats.spec.memory.limit;
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
        var minWindow = min - (max - min) / 10;
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
                title: "Megabytes",
                viewWindow: {
                    min: minWindow
                }
            },
            legend: {
                position: 'bottom'
            }
        };
        if (min === max) {
            opts.vAxis.viewWindow.max = 1.1 * max;
            opts.vAxis.viewWindow.min = 0.9 * max;
        }
        var chart = new google.visualization.LineChart(document.getElementById("chart-ram"));
        chart.draw(dataTable, opts);

    }
});
