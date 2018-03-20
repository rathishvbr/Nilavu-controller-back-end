export default Ember.Component.extend({

    enabledRegion: function() {
      return this.get('region.enabled') === false || this.get('region.enabled') === undefined ? false : true ;
    }.property('region.enabled'),

    regionName: Ember.computed.alias('region.name'),
    regionFlag: Ember.computed.alias('region.flag')

});
