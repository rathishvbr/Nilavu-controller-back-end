export default Nilavu.Route.extend({

    redirect() {
        return this.redirectIfLoginRequired();
    },

    model() {
        const self = this;
        var billers = this.store.createRecord('billers');
        return billers.reload().then(function() {
            self.set('loading', false);
            return billers;
        }).catch(function() {
            self.set('loading', false);
        });
    },

    setupController(controller, model) {
        const billersController = this.controllerFor('billers');
        billersController.setProperties({model});
    },

    activate() {
        this._super();
        this.controllerFor("application").setProperties({showTop: true, showFooter: true});
    },

    renderTemplate() {
        this.render('billers/activate', {controller: 'billers'});
    }

});
