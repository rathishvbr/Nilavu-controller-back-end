export default Nilavu.Route.extend({

    redirect() {
        return this.redirectIfLoginRequired();
    },

    model(params) {
        let topic = this.modelFor(params.type);
        const self = this;
        topic = this.store.createRecord(params.type, _.omit(params, 'username_filters', 'filter'));
        return topic.reload().then(function() {
            self.set('loading', false);
            return topic;
        }).catch(function() {
            self.set('loading', false);
        });
    },

    setupController(controller, model) {
        controller.setProperties({model});
    },

    renderTemplate() {
        this.render('vnc', {controller: 'vnc'});
    }
});
