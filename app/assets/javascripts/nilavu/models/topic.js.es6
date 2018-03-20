import RestModel from 'nilavu/models/rest';
import PreloadStore from 'preload-store';
import FilterProperties from 'nilavu/models/filter-properties';

export function loadTopicView(topic, args) {
    const topicId = topic.get('id');

    const data = _.merge({}, args);

    const url = Nilavu.getURL("/t/") + topicId;

    const jsonUrl = (data.nearPost
        ? `${url}/${data.nearPost}`
        : url) + '.json';

    delete data.nearPost;
    delete data.__type;
    delete data.store;

    return PreloadStore.getAndRemove(`topic_${topicId}`, () => {
        return Nilavu.ajax(jsonUrl, {data});
    }).then(json => {
        topic.updateFromJson(json);
        return json;
    });
}

const Topic = RestModel.extend({
    message: null,
    errorLoading: false,

    postStream: function() {
        return this.store.createRecord('postStream', {
            id: this.get('id'),
            topic: this
        });
    }.property(),

    preDeployUrl: function() {

        let slug = this.get('slug') || '';
        if (slug.trim().length === 0) {
            slug = "topic";
        }
        return Nilavu.getURL("/t/") + this.get('asms_id') + '/' + (this.get('id'));
    },

    postDeployUrl: function(params) {

        const slugId = this.get('id')
            ? this.get('id')
            : "";
        var url = '/t/' + (this.get('asms_id')) + '/' + slugId;
        if (params['forceOverride'] === 'true') {
            return url;
        }
        var toscaName = "";
        if (this.get('components') && this.get('components').length > 0) {
            toscaName = this.get('components')[0][0].tosca_type.split(".")[1];
        } else {
            toscaName = this.get("tosca_type").split(".")[1];
        }

        const urlSuffix = Em.isEqual(toscaName, "container") //this has to get from constants service
            ? "container" //import constants from 'nilavu/services/constants'; is not working here
            : "app";

        if (!Em.isEqual(toscaName, "torpedo")) {
            url = '/t/' + (this.get('asms_id')) + '/' + slugId + '/' + urlSuffix;
        }

        return url;
    },

    launchName: function(params) {
        if (FilterProperties.byKey(this.get('inputs'), "user_launch_labeledname")) {
            return FilterProperties.byKey(this.get('inputs'), "user_launch_labeledname");
        }
        return this.get('name');
    },

    filteredCategory: function() {
        if (this.get('components') && this.get('components').length > 0) {
            return this.get('components')[0][0].tosca_type.split(".")[1].replace("collaboration", "app").replace("analytics", "app").replace("other", "app");
        }
        return this.get('tosca_type').split(".")[1];
    }.property(),

    // Update our attributes from a JSON result
    updateFromJson(json) {
        const self = this;
        self.set('details', json);

        const keys = Object.keys(json);

        keys.forEach(key => {
            self.set(key, json[key]);
        });
    },

    reload() {
        const self = this;
        return Nilavu.ajax('/t/' + (this.get('asms_id')) + '/' + this.get('id'), {type: 'GET'}).then(function(topic_json) {
            self.updateFromJson(topic_json);
        });
    }
});

Topic.reopenClass({
    NotificationLevel: {
        WATCHING: 3,
        TRACKING: 2,
        REGULAR: 1,
        MUTED: 0
    },

    create() {
        const result = this._super.apply(this, arguments);
        return result;
    },

    // Load a topic, but accepts a set of filters
    find(topicId, opts) {
        let url = Nilavu.getURL("/t/") + topicId;
        if (opts.nearPost) {
            url += "/" + opts.nearPost;
        }

        const data = {};
        if (opts.postsAfter) {
            data.posts_after = opts.postsAfter;
        }

        // Add the summary of filter if we have it
        if (opts.summary === true) {
            data.summary = true;
        }

        // Check the preload store. If not, load it via JSON
        return Nilavu.ajax(url + ".json", {data: data});
    },

    resetNew() {
        return Nilavu.ajax("/topics/reset-new", {type: 'PUT'});
    }
});

export default Topic;
