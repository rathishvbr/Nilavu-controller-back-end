import Report from 'admin/models/report';
import computed from 'ember-addons/ember-computed-decorators';

export default Ember.Controller.extend({
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
    tagName: 'tr',

    reportsType: function() {
        return "report-" + this.get('model.type');
    }.property("model.type", "rowvalues"),

    reports_data: function() {

        const data = this.get('model.data');
            var myobject = [];
             const rows = data.map(function(item) {
                var jsonVariable = {};
                 item.forEach(function(result) {

                    jsonVariable[result.key] = result.value;
                });
                myobject.pushObject(jsonVariable);
                jsonVariable = {};
                return jsonVariable;
            });
            this.set('rowvalues', myobject);
        return {};
    }.observes('model.type', 'model'),

    @computed()categoryOptions() {
        const arr = [
            {
                name: I18n.t('admin.dashboard.reports.category'),
                value: 'all'
            }
        ];
        return arr.concat(Nilavu.Site.currentProp('sortedCategories').map((i) => {
            return {name: i.get('name'), value: i.get('id')};
        }));
    },

    @computed('model.type')showCategoryOptions(modelType) {
        return !modelType.match(/_private_messages$/) && !modelType.match(/^page_view_/);
    },

    actions: {

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
