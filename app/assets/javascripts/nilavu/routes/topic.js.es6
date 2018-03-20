

// const SCROLL_DELAY = 500;

const TopicRoute = Nilavu.Route.extend({
  redirect() { return this.redirectIfLoginRequired(); },

  queryParams: {
    filter: { replace: true }
  },

  titleToken() {
    const model = this.modelFor('topic');
    if (model) {
      const result = model.get('title'),
            cat = model.get('category');

      // Only display uncategorized in the title tag if it was renamed
      if (cat && !(cat.get('isUncategorizedCategory') && cat.get('name').toLowerCase() === "uncategorized")) {
        let catName = cat.get('name');

        const parentCategory = cat.get('parentCategory');
        if (parentCategory) {
          catName = parentCategory.get('name') + " / " + catName;
        }

        return [result, catName];
      }
      return result;
    }
  },


  actions: {

    didTransition() {
      return true;
    },

    willTransition() {
      this._super();
      return true;
    }
  },


  setupParams(topic) {
    return topic;
  },

  model(params, transition) {
    const queryParams = transition.queryParams;
    let topic = this.modelFor('topic');
    if (topic && (topic.get('id') === parseInt(params.id, 10))) {

      this.setupParams(topic, queryParams);
      return topic;
    } else {
      topic = this.store.createRecord('topic', _.omit(params, 'username_filters', 'filter'));
      return this.setupParams(topic, queryParams);
    }
  },

  activate() {
    this._super();
  },

  deactivate() {
    this._super();
    },

  setupController(controller, model) {
    controller.setProperties({
      model,
      editingTopic: false,
      firstPostExpanded: false
    });
  }

});

RSVP.EventTarget.mixin(TopicRoute);

export default TopicRoute;
