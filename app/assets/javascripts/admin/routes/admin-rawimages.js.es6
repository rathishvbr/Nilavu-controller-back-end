export default Nilavu.Route.extend({
    model(params) {
        return params;
    },

    setupController: function(controller, model) {
        controller.setProperties({model});
    }
});
