import {buildSubPanel} from 'nilavu/components/sub-panel';
export default buildSubPanel('quota', {

    formSubmitted: false,
    payment: Nilavu.SiteSettings.whmcs_quotabased_payment_method,
    networkPort: Nilavu.SiteSettings.quotabased_networkport,
    driveType: Nilavu.SiteSettings.quotabased_drivetype,

    _initPanels: function() {
        this.get('model').parseProducts();
        this.get('model').parsePayments();
    }.on('init'),

    products: function() {
        if (!this.get('model.products')) {
            return;
        }
        return this.filterProduct(this.get('flavorOption'));
    }.property('model.products'),

    payments: function() {
        if (!this.get('model.paymentMethods')) {
            return;
        }
        return this.filterPayment(this.get('payment'));
    }.property('model.paymentMethods'),

    filterProduct: function(name) {
        return this.get('model.products').filter(function(e) {
            if (e.name === name) {
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
        addFunds: function() {
            this.set('formSubmitted', true);
            const self = this;
            return Nilavu.ajax("/billers", {
                data: {
                    pid: this.get('productId'),
                    paymentmethod: this.get('paymentMethod'),
                    billingcycle: this.get('model.billingcycle'),
                    force_redirect_action: "invoices"
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
