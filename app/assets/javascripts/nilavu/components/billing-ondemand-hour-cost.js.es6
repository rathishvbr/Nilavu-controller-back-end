export default Ember.Component.extend({
    totalHourlyCost: function() {
      const uf = this.get('unitFlav');
      if (!Ember.isEmpty(uf)) {
          return uf.costperhour();
      }
    }.property('unitFlav.costperhour'),

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
