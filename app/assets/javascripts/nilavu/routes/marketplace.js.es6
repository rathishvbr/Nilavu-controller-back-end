export default Nilavu.Route.extend({

    model() {
        const self = this;
        const marketplace = this.store.createRecord('marketplace');
        return marketplace.load().then(function() {
            self.set('loading', false);
            return marketplace;
        }).catch(function() {
            self.set('loading', false);
        });
    },

    setupController(controller, model) {
        const mktController = this.controllerFor('marketplace-add');
        mktController.setProperties({model: model});
    },

    renderTemplate() {
        this.render('marketplace/add', {
            controller: 'marketplace-add',
            outlet: 'list-container'
        });
    },

    actions: {
        didTransition() {
            this.controllerFor("application").set("showFooter", true);
            return true;
        }
    }
});
