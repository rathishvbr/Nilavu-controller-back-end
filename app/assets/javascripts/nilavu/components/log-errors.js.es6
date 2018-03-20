import {logCategoryPanel} from 'nilavu/components/log-category-panel';
import {observes} from 'ember-addons/ember-computed-decorators';

export default logCategoryPanel('errors', {
    errorMessages: [],

    @observes('message')messages() {
        const msg = this.get('message'),
            ss = JSON.parse(this.get('message').Message);
        if (Ember.isEqual(ss.Type.toLowerCase(), 'error')) {
            this.get('errorMessages').pushObject({
                source: ss.Source,
                type: ss.Type,
                color: "log-" + ss.Type.toLowerCase(),
                message: ss.Message,
                timestamp: msg.Timestamp
            });
        }
    }
});
