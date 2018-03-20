export default Nilavu.Route.extend({

    redirect() {
        return this.redirectIfLoginRequired();
    },

    model() {
        const self = this;
        var marketplaces = this.store.createRecord('marketplaces');
        return marketplaces.reload().then(function() {
            self.set('loading', false);
            return marketplaces;
        }).catch(function() {
            self.set('loading', false);
        });
    },

    setupController(controller, model) {
        const mktController = this.controllerFor('marketplaces');
        mktController.setProperties({model});
    },

    activate() {
        this._super();
    },

    renderTemplate() {
        this.render('marketplaces/show', {
            controller: 'marketplaces',
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
