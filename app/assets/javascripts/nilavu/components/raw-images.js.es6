export default Ember.Component.extend({

    rawImages: Ember.computed.alias('model.data.rawimages_data'),
    editingCost: false,

    rawimageRegions: function() {
        var rval = [];
        _.each(this.get("activeImages"), function(p) {
            rval.addObject({name: p.name, value: p.id});
        });
        return rval;
    }.property("activeImages"),

    activeImages: function() {
        const self = this;
        if (self.get('rawImages') && self.get('rawImages').length > 0) {
            const fullFlavor = this.get('rawImages').filter(function(c) {
                if (c.status !== self.constants.INPROGRESS) {
                    return c;
                }
            });
            

            return fullFlavor;
        }
        return [];
    }.property('rawImages'),

    activeISOImages: function(){
    return Ember.isEmpty(this.get("rawimageRegions")) ? false: true;
  }.property('rawimageRegions'),

    rawimagesOption: function() {
        if (this.get('activeImages'))
            return this.get('activeImages.firstObject.id');

        return "";
    }.property('activeImages'),

    selectedImage: function(){
      if(!Ember.isEmpty(this.get('model.rawImage'))){
      return this.get('model.rawImage');
    }
    return null;
    }.property('model.rawImage'),

    rawimagesOptionChanged: function() {
        const self = this;
        const fullFlavor = this.get('activeImages').filter(function(c) {
            if (c.name === self.get('selectedImage')) {
                return c;
            }
        });

        if (fullFlavor.length > 0) {
            return self.set('model.selectedRawimage', fullFlavor.get('firstObject'));
        }

    }.observes('selectedImage')

});
