import {
    buildCategoryPanel
} from 'nilavu/components/edit-category-panel';
import {
    observes
} from 'ember-addons/ember-computed-decorators';
export default buildCategoryPanel('backups', {

    showbackupspinnerVisible: false,
    takebackupspinner: false,
    backups: [],

    sortedBackup: Ember.computed.sort('backups', 'sortDefinition'),
    account_id: Ember.computed.alias('currentUser.email'),
    sortBy: 'created_at', // default sort by date
    reverseSort: true, // default sort in descending order
    sortDefinition: Ember.computed('sortBy', 'reverseSort', function() {
        let sortOrder = this.get('reverseSort') ?
            'desc' :
            'asc';
        return [`${this.get('sortBy')}:${sortOrder}`];
    }),

    backup_title: function() {
        return I18n.t("vm_management.backups.title");
    }.property(),

    backup_description: function() {
        return I18n.t("vm_management.backups.description");
    }.property(),

    backup_list_title: function() {
        return I18n.t("vm_management.backups.list_title");
    }.property(),

    content_id: function() {
        return I18n.t("vm_management.backups.content_id");
    }.property(),

    content_name: function() {
        return I18n.t("vm_management.backups.content_name");
    }.property(),

    content_created_at: function() {
        return I18n.t("vm_management.backups.content_created_at");
    }.property(),

    content_status: function() {
        return I18n.t("vm_management.backups.content_status");
    }.property(),

    backup_action: function() {
        return I18n.t("vm_management.backups.backup_action");
    }.property(),

    emptybackups: function() {
        return I18n.t("vm_management.backups.content_empty");
    }.property(),

    showSpinner: function() {
        return this.get("showbackupspinnerVisible");
    }.property("showbackupspinnerVisible"),

    showTakebackupSpinner: function() {
        return this.get("takebackupspinner");
    }.property("takebackupspinner"),

    @observes('selectedTab') tabChanged() {
        if (Ember.isEqual(this.get('selectedTab'), "backups")) {
            this.getbackups();
        };
    },

    getbackups: function() {
        var self = this;
        this.set("showbackupspinnerVisible", true);
        Nilavu.ajax("/t/" + this.get('model').id + "/backups/list/all", {
            type: 'GET'
        }).then(function(result) {
            self.set("showbackupspinnerVisible", false);
            if (result.success) {
                self.set('backups', result.message.backups_all);
            } else {
                self.notificationMessages.error(I18n.t("vm_management.backups.list_error"));
            }
        }).catch(function() {
            self.set("showbackupspinnerVisible", false);
            self.notificationMessages.error(I18n.t("vm_management.backups.list_error"));
        });
    },

    backupListEmpty: function() {
        if (Em.isEmpty(this.get('backups'))) {
            return true;
        } else {
            return false;
        }
    }.property("backups"),

    filteredToscaType: function() {
        if (this.get('model.components') && this.get('model.components').length > 0) {
            return this.get('model.components')[0][0].tosca_type;
        }
        return this.get('model.tosca_type');
    },

    getData() {
        return {
            account_id: this.get("account_id"),
            asm_id: this.get('model').id,
            name: this.get('model').name,
            cattype: this.filteredToscaType().split(".")[1],
            status: this.constants.INPROGRESS,
            tosca_type: this.filteredToscaType(),
        };
    },

    actions: {

        takeBackup() {
            var self = this;
            this.set('takebackupspinner', true);

            Nilavu.ajax('/t/' + this.get('model').id + "/backup/create", {
                data: this.getData(),
                type: 'POST'
            }).then(function(result) {
                self.set('takebackupspinner', false);
                if (result.success) {
                    self.notificationMessages.success(I18n.t("vm_management.backups.take_backup_success"));
                    self.tabChanged();
                } else {
                    self.notificationMessages.error(I18n.t("vm_management.backups.take_backup_error"));
                }
            }).catch(function() {
                self.set('takebackupspinner', false);
                self.notificationMessages.error(I18n.t("vm_management.backups.take_backup_error"));
            });
        },
        getbackupsRefresh() {
            this.getbackups();
        }
    }

});
