export default Nilavu.Route.extend({

    redirect() {
        return this.redirectIfLoginRequired();
    },

    setupParams(topic) {
        return topic;
    },

    model(params, transition) {
        const queryParams = transition.queryParams;
        let topic = this.modelFor('topic');
        const self = this;
      
        topic = this.store.createRecord('topic', _.omit(params, 'username_filters', 'filter'));
        return topic.reload().then(function() {
            self.set('loading', false);
            topic.asmsid = queryParams.asms_id;
            return self.setupParams(topic);
        }).catch(function() {
            self.set('loading', false);
        });
    },

    setupController(controller, model) {
        controller.setProperties({model});
    },

    renderTemplate() {
        this.render('shell', {controller: 'shell'});
    }
});
