export default Nilavu.Route.extend({

    redirect() {
        return this.redirectIfLoginRequired();
    },

    setupParams(buckets) {
        return buckets;
    },

    model() {
        const self = this;

        var buckets = this.store.createRecord('buckets');

        return buckets.reload().then(function() {
            self.set('loading', false);
            return self.setupParams(buckets);
        }).catch(function() {
            self.set('loading', false);
            self.notificationMessages.error(I18n.t("storages.onboard_error"));
        });
    },

    setupController(controller, model) {
        const storageController = this.controllerFor('storages-list');
        storageController.setProperties({model});
    },

    activate() {
        this._super();
    },

    deactivate() {
        this._super();
    },

    renderTemplate() {

        this.render('storages/list', {
            controller: 'storages-list',
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
