export default Ember.Component.extend({
    monthlyCost: function() {
      const uf = this.get('unitFlav');
      if (!Ember.isEmpty(uf)) {
          return uf.costpermonth();
      }
    }.property('unitFlav.costpermonth'),

    currency: function() {
        const regionCurrency = this.get('unitFlav.currency');
        if (regionCurrency) {
            return new Handlebars.SafeString(regionCurrency);
        }
          return "$";
    }.property('unitFlav','flavor'),

    _rerenderOnChange: function() {
        this.rerender();
    }.observes('unitFlav')

});
