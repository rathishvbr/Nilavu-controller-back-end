export default Ember.Controller.extend({

    flavorsData: Ember.computed.alias('model.response.flavors_data'),

    emptyFlavors: function() {
        return (Ember.isEmpty(this.get('flavorsData')));
    }.property('model'),

    noOfFlavors: function(){
      return this.get('flavorsData.length');
    }.property('flavorsData.length'),
});
