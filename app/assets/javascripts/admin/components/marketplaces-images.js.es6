import {buildMarketplacesPanel} from 'admin/components/marketplaces-panel';
// import {observes} from 'ember-addons/ember-computed-decorators';

export default buildMarketplacesPanel('images', {
    isClicked: false,
    showSpinner: false,
    sortedRawimages: Ember.computed.sort('rawimages', 'sortDefinition'),
    account_id: Ember.computed.alias('currentUser.email'),
    sortBy: 'created_at', // default sort by date
    reverseSort: true, // default sort in descending order
    sortDefinition: Ember.computed('sortBy', 'reverseSort', function() {
        let sortOrder = this.get('reverseSort')
            ? 'desc'
            : 'asc';
        return [`${this.get('sortBy')}:${sortOrder}`];
    }),

    resources: function() {
        const _regionOption = 'flavors';
        if (this.get('regions') && this.get('regions').length > 0) {
            const fullFlavor = this.get('regions').filter(function(c) {
                if (c.name !== _regionOption) {
                    return c;
                }
            });
            return fullFlavor;
        }
        return [];
    }.property('regions'),

    btnTitle: function(){
      return I18n.t("admin.marketplaces.images.refresh");
    }.property(),

    subRegionOption: function() {
      if (!this.get('resources')) {
          return;
      }
        if (this.get('resources'))
            this.set('region', this.get('resources.firstObject.name'));

        return this.get('resources.firstObject.name');
    }.property('resources'),

    submitDisabled: function() {
        return (Ember.isEmpty(this.get('isoUrl')) || Ember.isEmpty(this.get('isoName')) || Ember.isEmpty(this.get('subRegionOption')));
    }.property('isoUrl', 'isoName', 'subRegionOption'),

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

    content_region: function() {
        return "Region";
    }.property(),

    images_list_title: function() {
        return I18n.t("admin.marketplaces.images.list_title");
    }.property(),

    _init: function() {
        this.getRawimages();
    }.on('init'),

    getRawimages: function() {
        var self = this;
        this.set("showSpinner", true);
        Nilavu.ajax("/admin/rawimages", {type: 'GET'}).then(function(result) {
            self.set("showSpinner", false);
            if (result.success) {
                self.setProperties({regions: result.regions, rawimages: result.data.rawimages_data});
            } else {
                self.notificationMessages.error(I18n.t("admin.marketplaces.images.list_error"));
            }
        }).catch(function() {
            self.set("showSpinner", false);
        });
    },

    rawimagesListEmpty: function() {
        if (Em.isBlank(this.get('rawimages'))) {
            return true;
        } else {
            return false;
        }
    }.property("rawimages"),

    regionOption: function() {
        this.set('region', this.get('model.region'));
    }.observes('model.region'),

    getData() {
        var region_data = [
            {
                key: "region",
                value: this.get('region')
            }
        ];
        var repo = {
            source: this.get('selectedTab'),
            public_url: this.get('isoUrl'),
            properties: []
        };
        return {account_id: this.get('account_id'), status: this.constants.INPROGRESS, repos: JSON.stringify(repo), inputs: JSON.stringify(region_data), name: this.get('isoName')};
    },

    actions: {
        toggleMirrorCreation: function() {
            this.toggleProperty('isClicked');
            this.set('isoUrl', '');
            this.set('isoName', '');
            this.set("showSpinner", false);

        },

        getImagesRefresh() {
            this.getRawimages();
        },

        createRawimages: function() {
            var self = this;
            this.set("showSpinner", true);
            Nilavu.ajax("/admin/rawimages", {
                data: self.getData(),
                type: 'POST'
            }).then(function(result) {
                self.set('showSpinner', false);
                if (result.success) {
                    self.notificationMessages.success(I18n.t("admin.marketplaces.images.rawimages_created"));
                    self.toggleProperty('isClicked');
                    self.getRawimages();
                } else {
                    self.toggleProperty('isClicked');
                    self.notificationMessages.error(I18n.t("admin.marketplaces.images.rawimages_failed"));
                }
            }).catch(function() {
                self.set('showSpinner', false);
                self.toggleProperty('isClicked');
                self.notificationMessages.error(I18n.t("admin.marketplaces.images.rawimages_failed"));
            });
        }

    }

});
