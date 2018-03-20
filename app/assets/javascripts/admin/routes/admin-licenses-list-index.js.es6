export default Nilavu.Route.extend({
  beforeModel: function() {
    this.transitionTo('adminLicensesList.show', 'active');
  }
});
