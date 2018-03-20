export default Ember.Component.extend({
    resourceChanged: function() {
        this.set('flavorcost', this.get('model.flavorcost'));
    }.observes('model.flavorcost'),

     unitFlavourChanged: function() {
          this.set('unitFlav', this.get('model.flavorcost'));
          this.rerender();
      }.observes('model.flavorcost'),

      unitchanged: function() {
           this.set('flavor', this.get('model.flavorvalue'));
      }.observes('model.flavorvalue'),

      currency: function() {
          const regionCurrency = this.get('unitFlav.currency');
          if (regionCurrency) {
              return new Handlebars.SafeString(regionCurrency);
          }
            return "$";
      }.property('unitFlav','flavor'),

      currentProducts: function(){
        const type = "snapshot";
        const product = this.get('products').filter(function(c) {
            if (c.quota_type !== type) {
                return c;
            }
        });

        return product;
      }.property('products'),

      currentProduct: function(){
        return this.get('currentProducts').length;
      }.property('currentProducts'),

      allocatedProducts: function() {
          const type = "snapshot";
          const product = this.get('products').filter(function(c) {
              if (Ember.isBlank(c.allocated_to) && c.quota_type !== type) {
                  return c;
              }
          });

          return product;
      }.property('products'),

      fixedBalance: function(){
           return parseFloat(this.get('currentBalance')).toFixed(2);
      }.property('currentBalance'),

      allocatedProduct: function(){
        return this.get('allocatedProducts').length;
      }.property('allocatedProducts'),

      _rerenderOnChange: function() {
          this.rerender();
      }.observes('unitFlav','model.flavorvalue'),

    //first time round, currency will be empty.

    currentUsage: Ember.computed.alias('model.usage'),

    currentBalance: Ember.computed.alias('model.paid.credit'),

    currentCredit: Ember.computed.alias('model.paid.biller_credit'),

    products: Ember.computed.alias('model.quotas.quota')

});
