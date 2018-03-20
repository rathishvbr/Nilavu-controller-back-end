import FilterProperties from 'nilavu/models/filter-properties';
import {observes} from 'ember-addons/ember-computed-decorators';
export default Ember.Component.extend({

  classNameBindings: [
      ':pad_0', ':flavor-col-sm-4'
  ],

    rawImageChanged: function() {
      this.set('model.rawImage', this.get('rawimagesOption'));
    },

    change: function() {
        Ember.run.once(this, 'rawImageChanged');
    },

    rawimagename: function(){
      return this.get('activeImage.name');
    }.property('activeImage.name'),

     status: function(){
       return this.get('activeImage.status');
     }.property('activeImage.status'),

      region: function(){
        return FilterProperties.byKey(this.get('activeImage.inputs'),"region");
      }.property('activeImage.inputs'),

      @observes('activeImage.@each')_rerenderOnChange() {
          this.rerender();
      }

});
