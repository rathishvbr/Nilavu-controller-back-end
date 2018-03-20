export default Nilavu.Route.extend({

  model: function(params) {
     return this.userFilter = params.filter;
   },
  setupController: function(controller, model) {
    controller._refreshUsers(model);
  }

});
