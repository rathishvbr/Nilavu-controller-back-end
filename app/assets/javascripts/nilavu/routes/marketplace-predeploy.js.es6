export default Nilavu.Route.extend({
    redirect() {
        return this.redirectIfLoginRequired();
    },

    model(params) {
      let marketplace = this.modelFor('marketplace');
      const self = this;
      marketplace = this.store.createRecord('marketplace', _.omit(params, 'username_filters', 'filter'));
      return marketplace.reload().then(function() {
          self.set('loading', false);
          return marketplace;
      }).catch(function() {
          self.set('loading', false);
      });

    },

    setupController(controller, model) {
        const self = this;
        controller.setProperties({model: model});
        self.set('loading', false);
        controller.subscribe();
        const postStream = controller.get('model.postStream');
        postStream.cancelFilter();
    },

    renderTemplate() {
        this.render('marketplace/predeploy', {
            controller: 'marketplace-predeploy',
            outlet: 'list-container'
        });
    }
});
