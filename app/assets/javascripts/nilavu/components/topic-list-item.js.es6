import FilterProperties from 'nilavu/models/filter-properties';

export default Ember.Component.extend({
  //topic: Em.computed.alias("content"),
  classNameBindings: ['controller.checked',
                      ':topic-list-item',
                      'unboundClassNames',
                      'selected'],
  attributeBindings: ['data-topic-id'],
  tagName: 'tr',
  'data-topic-id': Em.computed.alias('topic.id'),
  shell: false,

  _findTopicCategory: function() {
    const fullBrandUrl = this.get('topic.tosca_type');
    const split = fullBrandUrl.split('.');
    if (split[0] === "docker" || split[0] === "rancher") {
      this.set('shell', true);
    }
  }.on('init'),

  actions: {
    select() {
      this.set('controller.selectedRow', this);
    },

    toggleBookmark() {
      const self = this;
      this.get('topic').toggleBookmark().finally(function() {
        self.rerender();
      });
    },
    on()
    {

    }
  },

  host: function() {
      return FilterProperties.byKey(this.get('topic.inputs'),"vnchost");
  }.property('topic.inputs'),

  port: function() {
      return FilterProperties.byKey(this.get('topic.inputs'),"vncport");
  }.property('topic.inputs'),

  name: function() {
    return this.get("topic.name");
  }.property('topic'),
  
  modelType: function(){
    return this.get('topic.__type');
  }.property('topic.__type'),

  showBrandImage: function() {
    var fullBrandUrl = "";
    if(this.get('topic.components') && this.get('topic.components').length > 0)
    {
      fullBrandUrl = this.get('topic.components')[0][0].tosca_type;
    }
    else {
      fullBrandUrl = this.get('topic.tosca_type');
    }
      if (Em.isNone(fullBrandUrl)) {
          return `<img src="/images/brands/dummy.png" />`.htmlSafe();
      }

      const split = fullBrandUrl.split('.');

      if (split.length >= 2) {
          var brandImageUrl = split[2].trim().replace(/\s/g, '');
          return `<img src="/images/brands/${brandImageUrl}.png" />`.htmlSafe();
      }

      return `<img src="/images/brands/ubuntu.png" />`.htmlSafe();
  }.property('topic.tosca_type'),

  selected: function() {
    return this.get('controller.selectedRow')===this;
  }.property('controller.selectedRow'),

  unboundClassNames: function() {
    let classes = [];
    const topic = this.get('topic');

    if (topic.get('category')) {
      classes.push("category-" + topic.get('category.fullSlug'));
    }

    if (topic.get('hasExcerpt')) {
      classes.push('has-excerpt');
    }

    _.each(['liked', 'archived', 'bookmarked'],function(name) {
      if (topic.get(name)) {
        classes.push(name);
      }
    });

    return classes.join(' ');
  }.property(),

  titleColSpan: function() {
    return (!this.get('controller.hideCategory') &&
             this.get('topic.isPinnedUncategorized') ? 2 : 1);
  }.property("topic.isPinnedUncategorized"),


  hasLikes: function() {
    return this.get('topic.like_count') > 0;
  },

  hasOpLikes: function() {
    return this.get('topic.op_like_count') > 0;
  },

  expandPinned: function() {
    const pinned = this.get('topic.pinned');
    if (!pinned) {
      return false;
    }

    if (this.get('controller.expandGloballyPinned') && this.get('topic.pinned_globally')) {
      return true;
    }

    if (this.get('controller.expandAllPinned')) {
      return true;
    }

    return false;
  }.property(),

  click(e) {
    let target = $(e.target);

    if (target.hasClass('posts-map')) {
      if (target.prop('tagName') !== 'A') {
        target = target.find('a');
      }
      this.container.lookup('controller:application').send("showTopicEntrance", {topic: this.get('topic'), position: target.offset()});
      return false;
    }

    if (target.hasClass('bulk-select')) {
      const selected = this.get('controller.selected');
      const topic = this.get('topic');

      if (target.is(':checked')) {
        selected.addObject(topic);
      } else {
        selected.removeObject(topic);
      }
    }

    if (target.closest('a.topic-status').length === 1) {
      this.get('topic').togglePinnedForUser();
      return false;
    }
  },

  highlight() {
    const $topic = this.$();
    const originalCol = $topic.css('backgroundColor');
    $topic
      .addClass('highlighted')
      .stop()
      .animate({ backgroundColor: originalCol }, 2500, 'swing', function() {
        $topic.removeClass('highlighted');
      });
  },

  _highlightIfNeeded: function() {
    // highlight the last topic viewed
    if (this.session.get('lastTopicIdViewed') === this.get('topic.id')) {
      this.session.set('lastTopicIdViewed', null);
      this.highlight();
    } else if (this.get('topic.highlight')) {
      // highlight new topics that have been loaded from the server or the one we just created
      this.set('topic.highlight', false);
      this.highlight();
    }
  }.on('didInsertElement')

});
