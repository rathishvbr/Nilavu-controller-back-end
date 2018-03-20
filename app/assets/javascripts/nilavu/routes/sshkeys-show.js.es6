export default Nilavu.Route.extend({

    redirect() {
        return this.redirectIfLoginRequired();
    },

    setupParams(show) {
        return show;
    },

    model() {
        const self = this;
        var ssh = this.store.createRecord('ssh');
        return ssh.reload().then(function() {
            self.set('loading', false);
            return self.setupParams(ssh);
        }).catch(function() {
            self.set('loading', false);
        });
    },

    setupController(controller, model) {
        const sshController = this.controllerFor('sshkeys-show');
        sshController.setProperties({model});
    },

    renderTemplate() {
        this.render('sshkeys/show', {
            controller: 'sshkeys-show',
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
