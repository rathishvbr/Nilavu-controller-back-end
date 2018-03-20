import LaunchStatus from 'nilavu/models/launch-status';

// This route is used for retrieving a topic/:id based on params - id
export default Nilavu.Route.extend({

    model() {
        const self = this;

        const topic = this.modelFor('topic');

        return topic.reload().then(function() {
            self.set('loading', false);
            return topic;
        }).catch(function() {
            self.set('loading', false);
        });
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

    setupController(controller, model) {
        const topicController = this.controllerFor('topic');
        topicController.setProperties({model});
    },

    renderTemplate() {
        this.render('topic/show', {

            controller: 'topic',
            outlet: 'list-container'
        });
    }

});
