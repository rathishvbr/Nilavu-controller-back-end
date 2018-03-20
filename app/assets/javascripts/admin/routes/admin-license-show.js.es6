export default Nilavu.Route.extend({
  model: function() {
    return Nilavu.ajax('/admin/license/list/show', {
      data: {
        id: "1"
      },
      type: 'GET'});
  },

  setupController(controller, model) {
    const linceseController = this.controllerFor('adminLicenseShow');
    linceseController.setProperties({
      model: model
    });
  },
});
