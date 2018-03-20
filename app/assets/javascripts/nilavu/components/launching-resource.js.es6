import FlavorCost from 'nilavu/models/flavor_cost';

export default Ember.Component.extend({

    classNameBindings: [':flavor-scroll-wrapper'],

    unittedFlavors: function() {
        return FlavorCost.all(this.get('resource'), this.get('category'), this.get('flavorsData'));
    }.property('resource')
});
