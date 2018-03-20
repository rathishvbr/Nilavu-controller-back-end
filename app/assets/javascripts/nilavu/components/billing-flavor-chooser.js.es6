export default Ember.Component.extend({
    subFlavorChanged: function() {
        this.set('model.subFlavor', this.get('flavorOption'));
    },

    change: function() {
        Ember.run.once(this, 'subFlavorChanged');
    }
});
