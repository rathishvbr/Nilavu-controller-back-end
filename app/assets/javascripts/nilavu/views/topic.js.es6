import ClickTrack from 'nilavu/lib/click-track';
import Scrolling from 'nilavu/mixins/scrolling';

const TopicView = Ember.View.extend(Scrolling, {
  templateName: 'topic',
  topicBinding: 'controller.model',

  userFilters: Ember.computed.alias('controller.model.userFilters'),
  classNameBindings: ['controller.multiSelect:multi-select',
                      'topic.archetype',
                      'topic.is_warning',
                      'topic.category.read_restricted:read_restricted',
                      'topic.deleted:deleted-topic',
                      'topic.categoryClass'],
  menuVisible: true,
  SHORT_POST: 1200,

  categoryFullSlug: Em.computed.alias('topic.category.fullSlug'),
  postStream: Em.computed.alias('topic.postStream'),

  _composeChanged: function() {
    const composerController = Nilavu.get('router.composerController');
    composerController.clearState();
    composerController.set('topic', this.get('topic'));
  }.observes('composer'),

  _enteredTopic: function() {
    // Ember is supposed to only call observers when values change but something
    // in our view set up is firing this observer with the same value. This check
    // prevents scrolled from being called twice.
    const enteredAt = this.get('controller.enteredAt');
    if (enteredAt && (this.get('lastEnteredAt') !== enteredAt)) {
      this.scrolled();
      this.set('lastEnteredAt', enteredAt);
    }
  }.observes('controller.enteredAt'),

  _inserted: function() {
    this.bindScrolling({name: 'topic-view'});

    $(window).on('resize.discourse-on-scroll', () => this.scrolled());

    this.$().on('mouseup.discourse-redirect', '.cooked a, a.track-link', function(e) {
      // bypass if we are selecting stuff
      const selection = window.getSelection && window.getSelection();
      if (selection.type === "Range" || selection.rangeCount > 0) {
        if (Nilavu.Utilities.selectedText() !== "") {
          return true;
        }
      }

      const $target = $(e.target);
      if ($target.hasClass('mention') || $target.parents('.expanded-embed').length) { return false; }

      return ClickTrack.trackClick(e);
    });

  }.on('didInsertElement'),

  // This view is being removed. Shut down operations
  _destroyed: function() {
    this.unbindScrolling('topic-view');
    $(window).unbind('resize.discourse-on-scroll');

    // Unbind link tracking
    this.$().off('mouseup.discourse-redirect', '.cooked a, a.track-link');

    this.resetExamineDockCache();

  }.on('willDestroyElement'),

  gotFocus: function() {
    if (Nilavu.get('hasFocus')){
      this.scrolled();
    }
  }.observes("Nilavu.hasFocus"),

  resetExamineDockCache: function() {
    this.set('docAt', false);
  },

  offset: 0,
  hasScrolled: Em.computed.gt("offset", 0),

  // The user has scrolled the window, or it is finished rendering and ready for processing.
  scrolled() {
    if (this.isDestroyed || this.isDestroying || this._state !== 'inDOM') {
      return;
    }

    const offset = window.pageYOffset || $('html').scrollTop();
    if (!this.get('docAt')) {
      const title = $('#topic-title');
      if (title && title.length === 1) {
        this.set('docAt', title.offset().top);
      }
    }

    this.set("offset", offset);

    // Trigger a scrolled event
    this.appEvents.trigger('topic:scrolled', offset);
  }
});

export default TopicView;
