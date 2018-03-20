export default Nilavu.Route.extend({
    redirect() {
        return this.redirectIfLoginRequired();
    },

    model() {
        const self = this;
        const topic = this.modelFor('topic');
        return topic.reload().then(function() {
            self.set('loading', false);
            return topic;
        }).catch(function() {
            self.notificationMessages.error(I18n.t("vm_management.topic_load_error"));
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

    deactivate() {
        this._super();
        const topicDeployController = this.controllerFor('topic-predeploy');
        topicDeployController.unsubscribe();
    },

    renderTemplate() {

        this.render('topic/predeploy', {
            controller: 'topic-predeploy',
            outlet: 'list-container'
        });
    }

});
