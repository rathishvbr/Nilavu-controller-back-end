export default Ember.Component.extend({
  quotaCount: function() {
          return this.get('category.unitoption.quota_count');
  }.property('category.unitoption'),

  ondemandProduct: function() {
      return Ember.isEmpty(this.get('category.unitoption.quota_ids'));
  }.property('category.unitoption'),

});
