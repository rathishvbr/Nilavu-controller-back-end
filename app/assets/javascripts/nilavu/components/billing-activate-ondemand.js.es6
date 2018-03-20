import {
    buildSubPanel
} from 'nilavu/components/sub-panel';

export default buildSubPanel('ondemand', {
    need: ['biller'],
    productName: Nilavu.SiteSettings.whmcs_ondemand_product,
    payment: Nilavu.SiteSettings.whmcs_ondemand_payment_method,
    orgName: Nilavu.SiteSettings.organization_name,
    networkPort: Nilavu.SiteSettings.ondemand_networkport,
    driveType: Nilavu.SiteSettings.ondemand_drivetype,

    formSubmitted: false,

    products: function() {
        if (!this.get('model.products')) {
            return;
        }
        return this.filterProduct(this.get('productName'));
    }.property('model.products'),

    payments: function() {
        if (!this.get('model.paymentMethods')) {
            return;
        }
        return this.filterPayment(this.get('payment'));
    }.property('model.paymentMethods'),

    filterProduct: function(name) {
        return this.get('model.products').filter(function(e) {
            if (e.description === name) {
                return e;
            }
        });
    },

    filterPayment: function(name) {
        return this.get('model.paymentMethods').filter(function(e) {
            if (e.module === name) {
                return e;
            }
        });
    },

    productId: function() {
        if (!this.get('products')) {
            return;
        }
        const filteredProducts = this.get('products');
        if (filteredProducts.length > 0) {
            return filteredProducts.get('firstObject.pid');
        }
    }.property('products'),

    produts: function() {
        return this.set('model.productId', this.get('productId'));
    }.property('productId'),

    paymentMethod: function() {
        if (this.get('model.paymentMethods.module')) {
            return this.get('model.paymentMethods.module');
        } else {
            if (!this.get('payments')) {
                return;
            }
            const filteredPayments = this.get('payments');
            if (filteredPayments.length > 0) {
                return filteredPayments.get('firstObject.module');
            }
        }
    }.property('payments'),


    actions: {
        save() {
            this.set('formSubmitted', true);
            const self = this;
            return Nilavu.ajax("/billers", {
                data: {
                    //pid: this.get('productId'),
                    //paymentmethod: this.get('paymentMethod'),
                    //billingcycle: this.get('model.billingcycle'),
                    force_redirect_action: "addfunds"
                },
                type: 'POST'
            }).then(function(result) {
                self.set('formSubmitted', false);
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
