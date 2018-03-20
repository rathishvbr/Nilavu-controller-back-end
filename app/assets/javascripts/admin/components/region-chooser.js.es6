export default Ember.Component.extend({

    RegionChanged: function() {
        this.set('model.region', this.get('subRegionOption'));
    },

    change: function() {
        Ember.run.once(this, 'RegionChanged');
    }
});
