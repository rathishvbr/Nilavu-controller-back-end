export default Ember.Component.extend({

    RegionsOption: function() {
        var rval = [];
        _.each(this.get("regions"), function(p) {
            rval.addObject({name: p.name, value: p.name});
        });
        return rval;
    }.property("regions")
});
