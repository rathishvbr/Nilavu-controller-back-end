import BufferedContent from 'nilavu/mixins/buffered-content';
import FlavorCost from 'nilavu/models/flavor_cost';

export default Ember.Controller.extend(BufferedContent, {
    needs: ['application'],
    loading: false,
    formSubmitted: false,
    otpSubmitted: false,
    selectedTab: null,
    panels: null,

    hourlyBilling: Nilavu.SiteSettings.enabled_hourly_billing,
    monthlyBilling: Nilavu.SiteSettings.enabled_monthly_billing,

    _initPanels: function() {
        this.set('panels', []);
        if (this.get('hourlyBilling')) {
            return this.set('selectedTab', 'ondemand');
        }
        return this.set('selectedTab', 'quota');
    }.on('init'),

    enableHourlyBilling: function() {
        return this.get('hourlyBilling');
    }.property(),

    enableMonthlyBilling: function() {
        return this.get('monthlyBilling');
    }.property(),

    billingsOFF: function() {
        return !this.get('hourlyBilling') && !this.get('monthlyBilling');
    }.property(),

    hourlySelected: function() {
        return this.selectedTab === 'ondemand';
    }.property('selectedTab'),

    monthlySelected: function() {
        return this.selectedTab === 'quota';
    }.property('selectedTab'),

    title: function() {
        return 'Subscriptions';
    }.property('model'),

    regions: Ember.computed.alias('model.regions'),
    flavorsData: Ember.computed.alias('model.flavors.flavors_data'),

    flavors: function(){
      const self =this;
      if (!this.get('flavorsData')) {
          return;
      }
      const fullFlavor = this.get('flavorsData').filter(function(c) {
          if (c.regions.get('firstObject') === self.get('billingRegionOption')) {
              return c;
          }
      });
      if (fullFlavor.length > 0) {
          return fullFlavor;
      }
    }.property('flavorsData','billingRegionOption'),

    flavorOption: function() {
        if (this.get('flavors'))
            return this.get('flavors.firstObject.name');

        return "";

    }.property('flavors'),

    subFlavorChanged: function() {
        if (!this.get('flavors')) {
            return;
        }

        const _flavorOption = this.get('flavorOption');

        const fullFlavor = this.get('flavors').filter(function(c) {
            if (c.name === _flavorOption) {
                return c;
            }
        });

        if (fullFlavor.length > 0) {
            this.set('model.flav', fullFlavor.get('firstObject'));
        }
    }.observes('model.subFlavor'),

    billingRegionOption: function() {
        if (this.get('regions'))
            return this.get('regions.firstObject.name');

        return "";
    }.property('regions'),

    regionChanged: function() {
        if (!this.get('regions')) {
            return;
        }
        const _regionOption = this.get('billingRegionOption');

        const fullFlavor = this.get('regions').filter(function(c) {
            if (c.name === _regionOption) {
                return c;
            }
        });
        if (fullFlavor.length > 0) {
            this.set('model.subresource', fullFlavor.get('firstObject'));
        }
    }.observes('model.billregion'),

    unitFlav: function() {
        const fc = FlavorCost.allForProducts(this.get('model'),this.get('model.flav'));
        if (!Ember.isEmpty(fc) && fc.length > 0) {
            const propagate = fc.objectAt(0);
            this.set('flavorcost', propagate);
            return propagate;
        }
        return;
    }.property('model.flav','model.subresource'),

    skipButton: function() {
        return this.get("currentUser.authority") === "admin";
    }.property('currentUser.authority'),

    actions: {
        skipBilling() {
            this.set('skipingBilling', true);
            var self = this;
            return Nilavu.ajax("/subscriptions/activation/skip", {
                data: {},
                type: 'PUT'
            }).then(function(result) {
                if (result.update.status === 201) {
                    self.transitionToRoute("/");
                } else {
                    self.notificationMessages.error(I18n.t('billing.error'));

                }
                self.set('skipingBilling', false);
            });
        }
    }
});
