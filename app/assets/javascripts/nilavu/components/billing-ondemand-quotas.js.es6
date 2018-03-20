import {observes} from 'ember-addons/ember-computed-decorators';

export default Ember.Component.extend({
  fcpu: function() {
      return this.get('unitFlav.flavor.cpu');
  }.property('unitFlav.cpu'),

  fmemory: function() {
      return this.get('unitFlav.flavor.ram');
  }.property('unitFlav.memory'),

  fstorage: function() {
     return this.get('unitFlav.flavor.disk');
  }.property('unitFlav.storage')

});
