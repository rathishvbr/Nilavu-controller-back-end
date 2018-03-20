import RestModel from 'nilavu/models/rest';

const Billers = RestModel.extend({

    products: Ember.computed.alias('shopper.productsdetail.products.product'),
    paymentMethods: Ember.computed.alias('shopper.payments.paymentmethods.paymentmethod'),
    billingcycle: Nilavu.SiteSettings.whmcs_ondemand_billingcycle,

    // Update our attributes from a JSON result
    updateFromJson(json) {
        const self = this;
        self.set('subscriptions', json);

        const keys = Object.keys(json);

        keys.forEach(key => {
            self.set(key, json[key]);
        });
    },


    reload() {
        const self = this;
        return Nilavu.ajax('/billers/bill/activation', {
            type: 'GET'
        }).then(function(subs_json) {
            self.updateFromJson(subs_json);
        });
    },

    parseProducts() {
        if (!jQuery.isArray(this.get('products'))) {
            if (typeof this.get('products.product') !== "undefined" && this.get('products.product') !== null) {
                this.set('products', this.get('products.product'));
                this.parseProducts();
            }
            return;
        } else {
            return;
        }
    },

    parsePayments() {
        if (!jQuery.isArray(this.get('paymentMethods'))) {
            if (typeof this.get('paymentMethods.paymentmethod') !== "undefined") {
                this.set('paymentMethods', this.get('paymentMethods.paymentmethod'));
                this.parsePayments();
            }
            return;
        } else {
            return;
        }
    }

});

export default Billers;
