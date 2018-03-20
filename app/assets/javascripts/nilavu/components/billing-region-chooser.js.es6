export default Ember.Component.extend({

    billingRegionChanged: function() {
        this.set('model.billregion', this.get('billingRegionOption'));
    },

    change: function() {
        Ember.run.once(this, 'billingRegionChanged');
    }
});
