export default Ember.Component.extend({
    tagName: 'div',
    classNameBindings: [':tl-row'],

    set_data: function() {
     const rescent_data = this.get('recentlaunch');
     this.set('x',rescent_data.x);
     this.set('status', rescent_data.y.split(",")[0]);
     this.set('email', rescent_data.y.split(",")[1]);
      return rescent_data.y.split(",")[2];
    }.property("recentlaunch")

});
