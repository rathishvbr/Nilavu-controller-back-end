export default Nilavu.Route.extend({

    redirect() {
        return this.redirectIfLoginRequired();
    },

    setupParams(bucketfiles) {
        return bucketfiles;
    },

    model(params) {
        const self = this;
        var bucketfiles = this.store.createRecord('bucketfiles');
        return bucketfiles.reload(params.id).then(function() {
            self.set('loading', false);
            return self.setupParams(bucketfiles);
        }).catch(function() {
            self.set('loading', false);
            self.notificationMessages.error(I18n.t("storages.onboard_error"));
        });
    },

    setupController(controller, model) {
        const storageController = this.controllerFor('storages-show');
        storageController.setProperties({model});
    },

    activate() {
        this._super();
    },

    deactivate() {
        this._super();
    },

    renderTemplate() {

        this.render('storages/show', {
            controller: 'storages-show',
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
