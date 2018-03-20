import LaunchStatus from 'nilavu/models/launch-status';

// This route is used for retrieving a topic/:id based on params - id
export default Nilavu.Route.extend({

    // Avoid default model hook
    model(params) {
        return params;
    },

    afterModel() {
        const topic = this.modelFor('topic');
        if (this.showPredeployer(topic)) {
            this.replaceWith(topic.preDeployUrl() + '/predeploy', topic);
        }
    },

    showPredeployer: function(topic) {
        if (topic && topic.predeploy_finished) {
            return false;
        }
        const launchSuccess = LaunchStatus.create({event_type: topic.state}).get('launchKey');
        if (topic && launchSuccess) {
            return true;
        }
        return false;
    },

    setupController(controller, params) {
        params = params || {};
        const self = this,
            topic = this.modelFor('topic'),
            topicController = this.controllerFor('topic');
        params.forceLoad = false;
        topic.reload().then(function() {
            topicController.setProperties({model: topic});
            self.set('loading', false);
        }).catch(function() {
            self.notificationMessages.error(I18n.t("vm_management.topic_load_error"));
            self.set('loading', false);
        });
    },

    renderTemplate() {

        this.render('topic/container', {
            controller: 'topic',
            outlet: 'list-container'
        });
    }

});
