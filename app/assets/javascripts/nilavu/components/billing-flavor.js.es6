export default Ember.Component.extend({

    subFlavor: function() {
        var rval = [];
        _.each(this.get("flavors"), function(p) {
            rval.addObject({name: p.name, value: p.name});
        });
        return rval;
    }.property("flavors")
});
