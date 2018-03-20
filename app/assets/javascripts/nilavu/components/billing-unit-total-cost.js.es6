export default Ember.Component.extend({
    currency: function() {
        const regionCurrency = this.get('unitFlav.currency');
        if (regionCurrency) {
            return new Handlebars.SafeString(regionCurrency);
        }
    }.property('unitFlav', 'flavor'),

    totalHourlyCost: function() {
        const uf = this.get('unitFlav');
        if (!Ember.isEmpty(uf)) {
            return uf.costperhour();
        }
    }.property('unitFlav.costperhour'),

    monthlyCost: function() {
        const uf = this.get('unitFlav');
        if (!Ember.isEmpty(uf)) {
            return uf.costpermonth();
        }
    }.property('unitFlav.costpermonth'),

    _rerenderOnChange: function() {
        this.rerender();
    }.observes('unitFlav')

});
