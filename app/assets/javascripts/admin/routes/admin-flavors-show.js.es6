import AdminFlavors from 'admin/models/admin-flavors';

export default Nilavu.Route.extend({

    model(params) {
        return AdminFlavors.show(params);
    },

    setupController(controller, model) {
        const flavorsController = this.controllerFor('adminFlavorsShow');
        flavorsController.setProperties({model: model});
    },

    renderTemplate() {
        this.render({into: 'admin', controller: 'admin-flavors-show'});
    }
});
