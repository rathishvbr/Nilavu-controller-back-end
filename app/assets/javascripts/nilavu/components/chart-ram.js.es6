import {observes} from 'ember-addons/ember-computed-decorators';
import Networks from 'nilavu/models/networks';

export default Ember.Component.extend({

    runningIP: "",

    setIPS() {
      this.set('network',Networks.aggregate(this.get('model.outputs')));
    },

    @observes('runningIP')validateIP() {
        if (!Em.isBlank(this.get('runningIP'))) {
            this.set("showNetworkSpinnerVisible", false);
            this.getMachineInfo();
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
            this.viewRam();
        };
    },

    viewRam: function() {
        var self = this;
        if (!Em.isBlank(self.get('runningIP'))) {
            this.startRefreshing();
            return;
        }
        if (Em.isBlank(self.get('network'))) {
            this.set("showCpuSpinnerVisible", false);
            this.set('visibleAlert', true);
            self.notificationMessages.error(I18n.t("vm_management.network.empty_ip_error"));
            return;
        }
        const data = Networks.ipSplitter(this.get('network')[0].value);
        if (data.length > 0) {
            this.set('networkIp', data.get('firstObject'));
        }
        Nilavu.ajax("/metrics/containers/?ip=" + self.get('networkIp'), {type: 'GET'}).then(function() {
            self.set("runningIP", self.get('networkIp'));
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
        Nilavu.ajax("/metrics/containers/?ip=" + this.get("runningIP"), {type: 'GET'}).then(function(stats) {
            _this.set("showNetworkSpinnerVisible", false);
            _this._drawChart(stats);
            return;
        });
        return;
    },

    getMachineInfo() {
        var _this = this;
        Nilavu.ajax("/metrics/machine/?ip=" + this.get("runningIP"), {type: 'GET'}).then(function(machineInfo) {
            _this.set("showNetworkSpinnerVisible", false);
            _this.set('machineInfo', machineInfo);
            return;
        });
    },

    _drawChart: function(stats) {
        var stats = stats;
        var machineInfo = this.get('machineInfo');

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
        var memory_limit = machineInfo.memory_capacity;
        if (stats.spec.memory.limit && (stats.spec.memory.limit < memory_limit)) {
            memory_limit = stats.spec.memory.limit;
        }
        var min = Infinity;
        var max = -Infinity;
        for (let i = 0; i < data.length; i++) {
            if (data[i] != null) {
                data[i][0] = new Date(data[i][0]);
            }
            for (let j = 1; j < data[i].length; j++) {
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
        for (let i = 1; i < titles.length; i++) {
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
