export default Nilavu.Route.extend({

    redirect() {
        return this.redirectIfLoginRequired();
    },

    setupParams(subs, params, result) {
        return result;
    },

    //TO-DO: When we move to ember-2.4 remove this and test by type the
    // url http://localhost:3000/subscriptions/account/activation in browser address bar.
    // The sequence of loading is
    //beforeModel, model, and then redirect.
    //Hence the redirectIfLoginRequired doesn't work when you hit the url directly in the browser.
    beforeModel: function( ) {
        const self = this;
        if (!Nilavu.User.current( )) {
            self.session.set( "shouldRedirectToUrl", window.location.href );
            self.replaceWith( 'login' );
        }
    },


    model(params) {
        const self = this;
        var subs = this.store.createRecord('subscriptions');

        return subs.check().then(function(result) {
            self.set('loading', false);
            return self.setupParams(subs, params, result);
        }).catch(function() {
            self.set('loading', false);
        });
    },

    setupController(controller, model) {
        const subsController = this.controllerFor('subscriptions');
        subsController.setProperties({model});
    },

    activate() {
        this._super();
        this.controllerFor("application").setProperties({
          showTop: true,
          showFooter: true,
        });
    },

    renderTemplate() {
        this.render('subscriptions/show', {controller: 'subscriptions'});
    }

});
