export default Nilavu.Route.extend({
    redirect() {
        return this.redirectIfLoginRequired();
    },

    setupParams(billing) {
        return billing;
    },

    model() {
        const self = this;

        var billing = this.store.createRecord('billing');

        return billing.reload().then(function() {
            self.set('loading', false);
            return self.setupParams(billing);
        }).catch(function() {
            self.set('loading', false);
        });
    },

    setupController(controller, model) {
        const billController = this.controllerFor('billing');
        billController.setProperties({model});
    },

    activate() {
        this._super();
    },

    renderTemplate() {
        this.render('billings/show', {
            controller: 'billing',
            outlet: 'list-container'
        });
    }
});
