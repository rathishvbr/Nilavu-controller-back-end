export default Nilavu.Route.extend({
  beforeModel: function() {
    
    const self = this;
    if (Nilavu.User.current()) {
          // User can create topic
          Ember.run.next(function() {
            self.controllerFor("discovery/topics").send('createTopic');
          });

    } else {
      // User is not logged in
      self.session.set("shouldRedirectToUrl", window.location.href);
      self.replaceWith('login');
    }
  }
});
