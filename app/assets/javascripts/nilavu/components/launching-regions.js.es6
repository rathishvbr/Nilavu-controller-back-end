export default Ember.Component.extend({

    regionsWithoutFlavors: function() {
        const _regionOption = 'flavors';
        const fullFlavor = this.get('regions').filter(function(c) {
            if (c.name !== _regionOption) {
                return c;
            }
        });

        return fullFlavor;
    }.property('regions')
});
