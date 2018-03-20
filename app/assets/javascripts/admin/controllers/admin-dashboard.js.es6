// import {setting} from 'nilavu/lib/computed';
import AdminDashboard from 'admin/models/admin-dashboard';
// import VersionCheck from 'admin/models/version-check';
import Report from 'admin/models/report';
import computed from 'ember-addons/ember-computed-decorators';
// import AdminDashboard from 'admin/models/admin-dashboard';

const ATTRIBUTES = [
    // 'disk_space',
    'admins',
    'moderators',
    'blocked',
    'suspended',
    // 'top_traffic_sources',
    // 'top_referred_topics',
    'updated_at'
];

const REPORTS = ['global_reports'];

// This controller supports the default interface when you enter the admin section.
export default Ember.Controller.extend({
    loading: null,
    versionCheck: null,
    dashboardFetchedAt: null,
    global_reports: null,
    count_reports: null,

    filterUserCount(key) {
        return this.get('user_count.data').filterBy('key', key)[0].value;
    },

    filterLaunchCount(key) {
        return this.get('launch_count.data').filterBy('key', key)[0].value;
    },

    filterCount: function() {
        this.set("user_count", this.get('count_reports').filterBy('data')[0]);
        this.set("launch_count", this.get('count_reports').filterBy('data')[1]);
        this.set("popularappsdot", this.get('count_reports').filterBy('data')[2]);
        this.set("recentlaunchesdot", this.get('count_reports').filterBy('data')[3]);
        this.set("recentsignupsdot", this.get('count_reports').filterBy('data')[4]);
        this.set("populardot", this.get('count_reports').filterBy('data')[5]);
        this.set("popularapps", this.dot_data(this.get('popularappsdot').data));
        this.set("recentlaunches", this.dot_data(this.get('recentlaunchesdot').data));
        this.set("recentsignups", this.dot_data(this.get('recentsignupsdot').data));
        this.set("popular_vitual_machine", this.dot_data(this.get('populardot').data));
        this.filterUserCount("all");
        this.empty_check();
    }.observes('count_reports'),

    reports_data: function() {

        const datat = this.get('global_reports');
        const data = datat[0].data;
        this.set('title', {title: datat[0].title});

        if (data && data.length > 0) {

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
        }
        return {};
    }.observes('global_reports'),

    empty_check() {

        if (this.get("popularapps") === undefined || this.get("popularapps").length < 1) {
            this.set('popularapps_empty', true);
        }

        if (this.get("recentlaunches") === undefined || this.get("recentlaunches").length < 1) {
         this.set('recentlaunches_empty', true);
         this.set('recentlaunches_empty_hight', 'height_31');

        }

        if (this.get("recentsignups") === undefined || this.get("recentsignups").length < 1) {
         this.set('recentsignups_empty', true);

        }

        if (this.get("popular_vitual_machine") === undefined || this.get("popular_vitual_machine").length < 1) {
         this.set('popular_vitual_machine_empty', true);
        }

        if (this.get("rowvalues") === undefined || this.get("rowvalues").length < 1) {
         this.set('empty_graph', true);
        }
    },

    dot_data(data) {

        if (data && data.length > 0) {
            var myobject = [];
            const rows = data.map(function(item) {
                var jsonVariable = {
                    x: item.key,
                    y: item.value
                };
                myobject.pushObject(jsonVariable);
                jsonVariable = {};
                return jsonVariable;
            });
            this.set('rowvaluesofdot', myobject);
            return this.get('rowvaluesofdot');
        }
    },

    setCount: function() {
        this.set('admin_count', this.filterUserCount("admin"));
        this.set('user_count', this.filterUserCount("all"));
        this.set('bitnami_count', this.filterLaunchCount("total_prepackaged_bitnami"));
        this.set('container_count', this.filterLaunchCount("total_containers"));
        this.set('vm_count', this.filterLaunchCount("total_vms"));
        this.set('vertice_package_count', this.filterLaunchCount("total_prepackaged_vertice"));
        this.set('custom_count', this.filterLaunchCount("total_customapps"));
        this.set('popular', this.filterLaunchCount("most_popular"));
    },

    fetchDashboard() {
        if (!this.get('dashboardFetchedAt') || moment().subtract(30, 'minutes').toDate() > this.get('dashboardFetchedAt')) {
            this.set('dashboardFetchedAt', new Date());
            this.set('loading', true);
            AdminDashboard.find().then(d => {
                this.set("global_reports", d.dashboard.global_reports);
                this.set("count_reports", d.dashboard.count_reports);
                this.set("regions", d.regions);
                REPORTS.forEach(name => this.set(name, d.dashboard[name].map(r => Report.create(r))));
                ATTRIBUTES.forEach(a => this.set(a, d.dashboard[a]));
                this.set('loading', false);
                this.setCount();
            });
        }
    },

    @computed('updated_at')updatedTimestamp(updatedAt) {
        return moment(updatedAt).format('LLL');
    },

    actions: {
        deletePage: function() {
            this.transitionToRoute("adminVmList");

        }
    }

});
