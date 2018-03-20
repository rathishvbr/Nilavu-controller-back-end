import FlavorCost from 'nilavu/models/flavor_cost';

export default Ember.Controller.extend({
    title: "Billing",
    formFundsSubmitted: false,
    formPurchaseSubmitted: false,
    transactions: Ember.computed.alias('model.transactions'),
    hourlyBilling: Nilavu.SiteSettings.enabled_hourly_billing,
    monthlyBilling: Nilavu.SiteSettings.enabled_monthly_billing,
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

    enableHourlyBilling: function() {
        return this.get('hourlyBilling');
    }.property(),

    enableMonthlyBilling: function() {
        return this.get('monthlyBilling');
    }.property(),

    billingsOFF: function() {
        return !this.get('hourlyBilling') && !this.get('monthlyBilling');
    }.property(),

    fillWidth: function() {
        if (this.get('hourlyBilling') && this.get('monthlyBilling')) {
          return '';
        }
        return 'width: 100%';
    }.property(),

    transactionEmpty: function() {
        if (Em.isEmpty(this.get('transactions'))) {
            return true;
        } else {
            return false;
        }
    }.property("transactions"),

    emptyTransactions: function() {
        return I18n.t("billing.transaction.content_empty");
    }.property(),


    submitFundsDisabled: function() {
        if (this.get('formFundsSubmitted'))
            return true;

        return false;
    }.property('formFundsSubmitted'),

    submitPurchaseDisabled: function() {
        if (this.get('formPurchaseSubmitted'))
            return true;

        return false;
    }.property('formPurchaseSubmitted'),

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


    //send the default region
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
        const fc = FlavorCost.allForProducts(this.get('model'), this.get('model.flav'));
        if (!Ember.isEmpty(fc) && fc.length > 0) {
            const propagate = fc.objectAt(0);
            this.set('flavorcost', propagate);
            return propagate;
        }
        return;

    }.property('model.flav', 'model.subresource'),

    supportEmail: function() {
        return Nilavu.SiteSettings.support_email;
    }.property(),

    supportPhoneNumber: function() {
        return Nilavu.SiteSettings.support_phonenumber;
    }.property(),

    //This has to be generic as we would support multiple billers
    whmcsClientAreaRedirect: function() {
        return Nilavu.SiteSettings.whmcs_clientarea_url;
    }.property(),

    actions: {
        addFunds: function() {
            this.set('formFundsSubmitted', true);
            return Nilavu.ajax("/billers", {
                data: {
                    force_redirect_action: "addfunds"
                },
                type: 'POST'
            }).then(function(result) {
                if (result.success === true) {
                    window.location.replace(result.whmcsurl);
                } else {
                    self.notificationMessages.error(I18n.t('billing.not_found'));
                }
            }).catch(function() {
                this.set('formFundsSubmitted', false);
                self.notificationMessages.error(I18n.t('billing.not_found'));
            });
        },

        orderNow: function() {
            this.set('formPurchaseSubmitted', true);
            const self = this;
            return Nilavu.ajax("/billers", {
                data: {
                    force_redirect_action: "cart"
                },
                type: 'POST'
            }).then(function(result) {
                self.set('formPurchaseSubmitted', false);
                if (result.success === true) {
                    window.location.replace(result.whmcsurl);
                } else {
                    self.notificationMessages.error(I18n.t('billing.not_found'));
                }
            }).catch(function() {
                self.notificationMessages.error(I18n.t('billing.not_found'));
            });
        }

    }
});
