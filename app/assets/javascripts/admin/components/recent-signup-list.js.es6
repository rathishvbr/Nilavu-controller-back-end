export default Ember.Component.extend({
    tagName: 'tr',

    set_data: function() {
     const lastsignup_data = this.get('lastsignup');
     this.set('x',lastsignup_data.x);
     this.set('active', lastsignup_data.y.split(",")[0]);
      return lastsignup_data.y.split(",")[1];
    }.property("lastsignup")

});
