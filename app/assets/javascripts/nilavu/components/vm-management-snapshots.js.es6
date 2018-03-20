import {buildCategoryPanel} from 'nilavu/components/edit-category-panel';
import {observes} from 'ember-addons/ember-computed-decorators';
export default buildCategoryPanel('snapshots', {

    showSnapshotSpinnerVisible: false,
    takeSnapShotSpinner: false,
    snapshots: [],
    sortedSnapshots: Ember.computed.sort('snapshots', 'sortDefinition'),
    account_id: Ember.computed.alias('currentUser.email'),
    sortBy: 'created_at', // default sort by date
    reverseSort: true, // default sort in descending order
    sortDefinition: Ember.computed('sortBy', 'reverseSort', function() {
        let sortOrder = this.get('reverseSort')
            ? 'desc'
            : 'asc';
        return [`${this.get('sortBy')}:${sortOrder}`];
    }),

    snapshot_title: function() {
        return I18n.t("vm_management.snapshots.title");
    }.property(),

    snapshot_description: function() {
        return I18n.t("vm_management.snapshots.description");
    }.property(),

    snapshot_list_title: function() {
        return I18n.t("vm_management.snapshots.list_title");
    }.property(),

    content_id: function() {
        return I18n.t("vm_management.snapshots.content_id");
    }.property(),

    content_name: function() {
        return I18n.t("vm_management.snapshots.content_name");
    }.property(),

    content_created_at: function() {
        return I18n.t("vm_management.snapshots.content_created_at");
    }.property(),

    content_status: function() {
        return I18n.t("vm_management.snapshots.content_status");
    }.property(),

    snapshot_action: function() {
        return I18n.t("vm_management.snapshots.snapshot_action");
    }.property(),

    emptySnapshots: function() {
        return I18n.t("vm_management.snapshots.content_empty");
    }.property(),

    showSpinner: function() {
        return this.get("showSnapshotSpinnerVisible");
    }.property("showSnapshotSpinnerVisible"),

    showTakeSnapshotSpinner: function() {
        return this.get("takeSnapShotSpinner");
    }.property("takeSnapShotSpinner"),

    @observes('selectedTab')tabChanged() {
        if (Ember.isEqual(this.get('selectedTab'), "snapshots")) {
            this.getSnapshots();
        };
    },

    getSnapshots: function() {
        var self = this;
        this.set("showSnapshotSpinnerVisible", true);
        Nilavu.ajax("/t/" + this.get('model').id + "/snapshots/list/all", {type: 'GET'}).then(function(result) {
            self.set("showSnapshotSpinnerVisible", false);
            if (result.success) {
                self.set('quotas', result.quotas.quota);
                self.set('snapshots', result.message.snapshots_per.body);

            } else {
                self.notificationMessages.error(I18n.t("vm_management.snapshots.list_error"));
            }
        }).catch(function() {
            self.set("showSnapshotSpinnerVisible", false);
            // self.notificationMessages.error(I18n.t("vm_management.snapshots.list_error"));
        });
    },

    snapshotListEmpty: function() {
        if (Em.isEmpty(this.get('snapshots'))) {
            return true;
        } else {
            return false;
        }
    }.property("snapshots"),

    snapshotQuotas: function() {
        const _quotaType = 'snapshot';
        const onlySnapshots = this.get('quotas').filter(function(c) {
            if (c.quota_type === _quotaType) {
                return c;
            }
        });
        return onlySnapshots;
    }.property('quotas'),

    hasQuota: Ember.computed.notEmpty('snapshotQuotas'),

    allowedLimit: function() {
        if (Ember.isEmpty(this.get('snapshotQuotas'))) {
            return true;
        }
        if (this.get('hasQuota')) {
            const no_of_units = this.get('snapshotQuotas')[0].allowed.filterBy('key', 'no_of_units')[0].value;
            return parseInt(no_of_units) <= 0
                ? false
                : true;
        }

    }.property('snapshotQuotas', 'hasQuota'),

    quotaId: function() {
        if (this.get('hasQuota')) {
            const snapshotQuota = this.get('snapshotQuotas');
            const limit = this.get('allowedLimit');
            return snapshotQuota.length > 0 && limit
                ? snapshotQuota[0].id
                : "";
        }
        return "";
    }.property('hasQuota','snapshotQuotas'),

    getData() {
        return {
            account_id: this.get("account_id"),
            asm_id: this.get('model').id,
            name: this.get('model').name,
            cattype: this.get('model').tosca_type.split(".")[1],
            quota_id: this.get('quotaId'),
            status: this.constants.INPROGRESS,
            tosca_type: this.get('model.tosca_type')
        };
    },

    actions: {
        takeSnapshot() {
            var self = this;
            this.set('takeSnapShotSpinner', true);
            if (!this.get('allowedLimit') && Nilavu.SiteSettings.allow_billings) {
                self.set('takeSnapShotSpinner', false);
                self.notificationMessages.warning(I18n.t("vm_management.snapshots.take_snapshot_fail"));
            }
            Nilavu.ajax('/t/' + this.get('model').id + "/snapshot/create", {
                data: this.getData(),
                type: 'POST'
            }).then(function(result) {
                self.set('takeSnapShotSpinner', false);
                if (result.success) {
                    self.notificationMessages.success(I18n.t("vm_management.snapshots.take_snapshot_success"));
                    self.tabChanged();
                } else {
                    // self.notificationMessages.error(I18n.t("vm_management.error"));
                }
            }).catch(function() {
                self.set('takeSnapShotSpinner', false);
                // self.notificationMessages.error(I18n.t("vm_management.error"));
            });
        },

        getSnapshotsRefresh() {
            this.getSnapshots();
        }
    }

});
