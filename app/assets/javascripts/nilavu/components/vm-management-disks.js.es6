import {buildCategoryPanel} from 'nilavu/components/edit-category-panel';
import {observes} from 'ember-addons/ember-computed-decorators';
import showModal from 'nilavu/lib/show-modal';
import Flavors from 'nilavu/models/flavors';
import FilterProperties from 'nilavu/models/filter-properties';

export default buildCategoryPanel('disks', {

    showDiskSpinnerVisible: false,
    addDiskSpinner: false,
    disks: [],

    sortedDisks: Ember.computed.sort('disks', 'sortDefinition'),
    account_id: Ember.computed.alias('currentUser.email'),
    sortBy: 'created_at', // default sort by date
    reverseSort: true, // default sort in descending order
    sortDefinition: Ember.computed('sortBy', 'reverseSort', function() {
        let sortOrder = this.get('reverseSort')
            ? 'desc'
            : 'asc';
        return [`${this.get('sortBy')}:${sortOrder}`];
    }),

    content_id: function() {
        return I18n.t("vm_management.disks.content_id");
    }.property(),

    content_name: function() {
        return I18n.t("vm_management.disks.content_name");
    }.property(),

    content_created_at: function() {
        return I18n.t("vm_management.disks.content_created_at");
    }.property(),

    content_status: function() {
        return I18n.t("vm_management.disks.content_status");
    }.property(),

    emptyDisks: function() {
        return I18n.t("vm_management.disks.content_empty");
    }.property(),

    showSpinner: function() {
        return this.get("showDiskSpinnerVisible");
    }.property("showDiskSpinnerVisible"),

    showAddDiskSpinner: function() {
        return this.get("addDiskSpinner");
    }.property("addDiskSpinner"),

    @observes('selectedTab')tabChanged() {
        if (Ember.isEqual(this.get('selectedTab'), "disks")) {
         this.getDisks();
         this.getFlavorPrice();
        };
    },

    getDisks: function() {
        var self = this;
        this.set("showDiskSpinnerVisible", true);
        Nilavu.ajax("/t/" + this.get('model').id + "/disks/show", {type: 'GET'}).then(function(result) {
            self.set("showDiskSpinnerVisible", false);
            if (result.success) {
                self.set('disks', result.message.disks_per.body);
            } else {
                self.notificationMessages.error(result.message);
            }
        }).catch(function() {
            self.set("showDiskSpinnerVisible", false);
            // self.notificationMessages.error(I18n.t("vm_management.snapshots.list_error"));
        });
    },

    getFlavorPrice: function() {
        var self = this;
        Flavors.reload(FilterProperties.byKey(this.get('model.inputs'),"flavor_id")).then(function(result){
         self.set('model.price', result.price);
        });
    },

    diskListEmpty: function() {
        if (Em.isEmpty(this.get('disks'))) {
            return true;
        } else {
            return false;
        }
    }.property("disks"),

    disk_title: function() {
        return I18n.t("vm_management.disks.tab_title");
    }.property(),

    disk_description: function() {
        return I18n.t("vm_management.disks.description");
    }.property(),

    disk_volume: function() {
        return I18n.t("vm_management.disks.disk_volume");
    }.property(),

    current_disk: function() {
        return I18n.t("vm_management.disks.disk_sub");
    }.property(),

    disk_action: function() {
        return I18n.t("vm_management.disks.disk_action");
    }.property(),

    actions: {

        addDisks() {
            showModal('diskCreate', {
                model: this.get("model"),
                title: 'vm_management.disks.modal_title',
                close: true,
                smallTitle: false,
                titleCentered: true
            });
        },
    }

});
