import AdminFlavors from 'admin/models/admin-flavors';

export default Nilavu.Route.extend({
    model() {
        let post = this.modelFor('adminFlavors');
        return post;
    },

    setupController(controller, model) {
        const flavorsController = this.controllerFor('adminFlavorsAdd');
        flavorsController.setProperties({model: model});
    },

    renderTemplate() {
        this.render({into: 'admin', controller: 'admin-flavors-add'});

    }
});
