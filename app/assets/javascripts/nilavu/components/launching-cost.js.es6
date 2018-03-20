export default Ember.Component.extend({

    unitFlavourChanged: function() {
        this.set('unitFlav', this.get('category.unitoption'));
        this.set('unitStorage', this.get('category.storageoption'));
        this.set('unitPack', this.get('category.packType'));
        this.rerender();
    }.observes('category.unitoption', 'category.storageoption', 'category.packType'),

    currency: function() {
        const regionCurrency = this.get('unitFlav.currency');
        if (regionCurrency) {
            return new Handlebars.SafeString(regionCurrency);
        }
        return new Handlebars.SafeString(this.get('category.currency_denoted'));
    }.property('unitFlav', 'category.currency_denoted'),

    unitPerHour: function() {
        const uf = this.get('unitFlav');
        return uf
            ? uf.costperhour(this.get('unitStorage')) * parseInt(this.get('category.number_of_units'))
            : 0;
    }.property('category.unitoption', 'unitFlav', 'unitStorage', 'unitPack', 'category.number_of_units'),

    unitPerMonth: function() {
        const uf = this.get('unitFlav');

        return uf
            ? uf.costpermonth(this.get('unitStorage')) * parseInt(this.get('category.number_of_units'))
            : 0;
    }.property('category.number_of_units', 'category.unitoption', 'unitFlav', 'unitPack', 'unitStorage'),

    unitsChanged: function() {
        this.set('category.number_of_units', this.get('category.duplicateoption'));
        this.rerender();
    }.observes('category.duplicateoption'),

    PaidorNot: function() {
        return !Ember.isEmpty(this.get('category.unitoption.quota_ids'));
    }.property('unitFlav'),

    costStatus: function() {
        return this.get('category.unitoption.status').toLowerCase();
    }.property('category.unitoption')

});
