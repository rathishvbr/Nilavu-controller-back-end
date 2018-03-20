import Report from 'admin/models/report';
export default Ember.Component.extend({
    queryParams: [
        "mode", "start-date", "end-date", "category-id", "group-id"
    ],
    viewMode: 'table',
    viewingTable: Em.computed.equal('viewMode', 'table'),
    viewingGraph: Em.computed.equal('viewMode', 'graph'),
    startDate: null,
    endDate: null,
    categoryId: null,
    category: [
        "all", "vm", "application", "container"
    ],
    group: ["group"],
    groupId: null,
    refreshing: false,
    type_launches: false,
    sortByAsc: false,
    sortByAscDate: false,
    sortByAscStatus: false,
    reportData: [],
    reportLaunchesData: [],
    sortProperties: ['name:asc'],
    sortededReportSales: Ember.computed.sort('reportData', 'sortProperties'),

    historyEmpty: function() {
        if (Em.isEmpty(this.get('sortededReportSales'))) {
            return true;
        } else {
            return false;
        }
    }.property("sortededReportSales"),

    emptyHistory: function() {
        return I18n.t("billing.transaction.history_content_empty");
    }.property(),

    _initPanels: function() {
        this.reports_data();
    }.on('init'),

    reports_data: function() {
        var xvalue,
            yvalue,
            name,
            status,
            number_of_hours;
        var data = [];
        this.get('model.reports.data').forEach(function(item) {
            name = item.filterBy('key', 'name')[0].value;
            status = item.filterBy('key', 'status')[0].value;
            number_of_hours = parseFloat(item.filterBy('key', 'number_of_hours')[0].value).toFixed(2);
            xvalue = item.filterBy('key', 'x')[0].value;
            yvalue = item.filterBy('key', 'y')[0].value;
            data.pushObject({x: xvalue, y: yvalue, number_of_hours: number_of_hours, status: status, name: name});

        });
        this.set('reportData', data);
        this.set('model.data', data);
    },

    actions: {

        sortBy() {
            if (this.get('sortByAsc')) {

                this.set('sortProperties', ["name:asc"]);
            } else {
                this.set('sortProperties', ["name:desc"]);

            }
            this.toggleProperty('sortByAsc');
        },

        sortByDate() {
            if (this.get('sortByAscDate')) {

                this.set('sortProperties', ["created_at:asc"]);
            } else {
                this.set('sortProperties', ["created_at:desc"]);

            }
            this.toggleProperty('sortByAscDate');
        },

        sortByStatus() {
            if (this.get('sortByAscStatus')) {

                this.set('sortProperties', ["status:asc"]);
            } else {
                this.set('sortProperties', ["status:desc"]);

            }
            this.toggleProperty('sortByAscStatus');
        },

        refreshReport() {
            var q;
            this.set("refreshing", true);
            this.setProperties({'start-date': this.get('startDate'), 'end-date': this.get('endDate'), 'category-id': this.get('categoryId')});

            if (this.get('groupId')) {
                this.set('group-id', this.get('groupId'));
            }

            q = Report.find(this.get("model.type"), this.get("startDate"), this.get("endDate"), this.get("categoryId"), this.get("groupId"));
            q.then(m => this.set("model", m)). finally(() => this.set("refreshing", false));
        },

        viewAsTable() {
            this.set('viewMode', 'table');
        },

        viewAsGraph() {
            this.set('viewMode', 'graph');
        }
    }
});
