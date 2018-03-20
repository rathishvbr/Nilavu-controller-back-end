import {observes} from 'ember-addons/ember-computed-decorators';
import NilavuURL from 'nilavu/lib/url';

export default Ember.Controller.extend({
    needs: ['application'],
    loading: false,
    formSubmitted: false,
    otpSubmitted: false,
    resendSubmitted: false,
    selectedTab: null,
    panels: null,
    showTop: true,
    createAddonSubmitted: false,
    addresssValidated: false,
    subscriber: Ember.computed.alias('model.addon.result'),
    mobavatar: Ember.computed.alias('model.mobavatar_activation.success'),
    phoneNumber: Ember.computed.alias('currentUser.phone'),

    @observes('subscriber')subscriberChecker: function() {},

    title: function() {
        return 'Subscriptions';
    }.property('model'),

    orderedCatTypes: function() {
        const grouped_results = this.get('model.results');

        let otmap = [];

        for (var order in grouped_results) {
            if (grouped_results.hasOwnProperty(order)) {
                otmap.push({order: order, cattype: grouped_results[order].get('firstObject.cattype').toLowerCase()});
            }
        }
        return otmap;
    }.property('model.results'),

    submitDisabled: function() {
        if (Ember.isEmpty(this.get('address')))
            return true;
        if (Ember.isEmpty(this.get('city')))
            return true;
        if (Ember.isEmpty(this.get('state')))
            return true;
        if (Ember.isEmpty(this.get('zipcode')))
            return true;
        if (Ember.isEmpty(this.get('country')))
            return true;

        return false;
    }.property('address', 'city', 'state', 'zipcode', 'country'),

    otpDisabled: function() {
        if (Ember.isEmpty(this.get('otpNumber')))
            return true;
        return false;
    }.property('otpNumber'),

    actions: {
        verifyOTP() {

            this.set('otpSubmitted', true);
            const self = this,
                attrs = this.getProperties('otpNumber');
            return Nilavu.ajax("/verify/otp", {
                data: {
                    otp: attrs.otpNumber
                },
                type: 'POST'
            }).then(function(result) {
                self.set('otpSubmitted', false);
                self.setProperties({otpNumber: ''});
                if (result.success) {
                    self.notificationMessages.success(I18n.t("user.activation.activate_phone_activated"));
                }

                if (!result.success) {
                    self.notificationMessages.error(I18n.t("user.activation.activate_phone_error"));
                }
            });
        },

        resendOTP() {
            this.set('resendSubmitted', true);
            const self = this,
                attrs = this.getProperties('phoneNumber');
            return Nilavu.ajax("/resendOTP", {
                data: {
                    phone: attrs.phoneNumber

                },
                type: 'POST'
            }).then(function(result) {
                self.set('resendSubmitted', false);
                if (result.success) {
                    self.notificationMessages.success(I18n.t("user.activation.otp_sent"));
                }
                if (!result.success) {
                    self.notificationMessages.error(I18n.t("user.activation.otp_send_error"));
                }
            });
        },

        createAddon() {
          var phone = this.get('currentUser.phone');
          var last_name = this.get('currentUser.last_name');
          if(Ember.isEmpty(this.get('currentUser.phone')))
          {
            phone = Nilavu.SiteSettings.client_phone_number;
          }
          if(Ember.isEmpty(this.get('currentUser.last_name')))
          {
            last_name = this.get('currentUser.first_name');
          }
            this.set('createAddonSubmitted', true);
            const self = this,
                attrs = this.getProperties('address', 'address2', 'city', 'state', 'zipcode', 'company', 'country');
            return Nilavu.ajax("/onboard", {
                data: {
                    firstname: this.get('currentUser.first_name'),
                    lastname: last_name,
                    address1: attrs.address,
                    address2: attrs.address2,
                    city: attrs.city,
                    state: attrs.state,
                    postcode: attrs.zipcode,
                    companyname: attrs.company,
                    country: self.get('selectedCountryData').toUpperCase(),
                    phonenumber: phone
                },
                type: 'POST'
            }).then(function(result) {
                self.set('createAddonSubmitted', false);
                if (result.addon) {

                    var rs = result.addon.parms;
                    if (Em.isEqual(rs.account_id, self.get('currentUser.email'))) {
                        self.notificationMessages.success(I18n.t("user.activation.addon_onboard_success"));
                        NilavuURL.routeTo('/billers/bill/activation');
                    }
                }
                else {
                    if (result.swallow_404 === false  && result.error) {
                        self.notificationMessages.error(result.error);
                    }
                    if (result.swallow_404 === false && !(result.error)) {
                        self.notificationMessages.error(I18n.t('billing.whmcs_error'));
                    }
                }
            });

        }
    },

    hasError: Ember.computed.or('model.notFoundHtml', 'model.message'),

    noErrorYet: Ember.computed.not('hasError')

});
