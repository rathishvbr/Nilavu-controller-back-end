import AdminFlavors from 'admin/models/admin-flavors';

export default Nilavu.Route.extend({

    model() {
        return AdminFlavors.reload();
    },

    setupController: function(controller, model) {
        controller.setProperties({model: model});
    }
});
