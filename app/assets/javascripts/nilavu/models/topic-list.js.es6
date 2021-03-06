import RestModel from 'nilavu/models/rest';

function topicsFrom(result, store) {
  if (!result) { return; }
  //Stitch together our side loaded data
  return result.topic_list.topics.map(function (t) {
    return store.createRecord('topic', t);
  });
}

const TopicList = RestModel.extend({

  canLoadMore: Em.computed.notEmpty("more_topics_url"),

  forEachNew(topics, callback) {
    const topicIds = [];

    _.each(this.get('topics'), topic => topicIds[topic.get('id')] = true);

    _.each(topics, topic => {
      if (!topicIds[topic.id]) {
        callback(topic);
      }
    });
  },

  refreshSort(order, ascending) {
    let params = this.get('params') || {};

    if (params.q) {
      // search is unique, nothing else allowed with it
      params = { q: params.q };
    } else {
      params.order = order || params.order;
      params.ascending = ascending;
    }

    this.set('params', params);
  },

  loadMore() {
    if (this.get('loadingMore')) { return Ember.RSVP.resolve(); }

    const moreUrl = this.get('more_topics_url');
    if (moreUrl) {
      const self = this;
      this.set('loadingMore', true);

      const store = this.store;
      return Nilavu.ajax({url: moreUrl}).then(function (result) {
        let topicsAdded = 0;

        if (result) {
          // the new topics loaded from the server
          const newTopics = topicsFrom(result, store),
              topics = self.get("topics");

          self.forEachNew(newTopics, function(t) {
            t.set('highlight', topicsAdded++ === 0);
            topics.pushObject(t);
          });

          self.setProperties({
            loadingMore: false,
            more_topics_url: result.topic_list.more_topics_url
          });

          Nilavu.Session.currentProp('topicList', self);
          return self.get('more_topics_url');
        }
      });
    } else {
      // Return a promise indicating no more results
      return Ember.RSVP.resolve();
    }
  },


  // loads topics with these ids "before" the current topics
  loadBefore(topic_ids) {
    const topicList = this,
          topics = this.get('topics');
    // refresh dupes
    topics.removeObjects(topics.filter(topic => topic_ids.indexOf(topic.get('id')) >= 0));

    const url = `${Nilavu.getURL("/")}${this.get('filter')}?topic_ids=${topic_ids.join(",")}`;
    const store = this.store;

    return Nilavu.ajax({ url }).then(result => {
      let i = 0;
      topicList.forEachNew(topicsFrom(result, store), function(t) {
        // highlight the first of the new topics so we can get a visual feedback
        t.set('highlight', true);
        topics.insertAt(i,t);
        i++;
      });
      Nilavu.Session.currentProp('topicList', topicList);
    });
  }
});

TopicList.reopenClass({

  munge(json, store) {
    json.inserted = json.inserted || [];
    /*
    json.can_create_topic = json.topic_list.can_create_topic;
    json.more_topics_url = json.topic_list.more_topics_url;
    */
    json.loaded = true;
    json.topics = topicsFrom(json, store);
    return json;
  },

  find(filter, params) {
    const store = Nilavu.__container__.lookup('store:main');
    return store.findFiltered('topicList', {filter, params});
  },

  // hide the category when it has no children
  hideUniformCategory(list, category) {
    list.set('hideCategory', category && !category.get("has_children"));
  }

});

export default TopicList;
