import NilavuURL from 'nilavu/lib/url';
import Clock from 'nilavu/services/clock';
import NilavuPollster from 'nilavu/lib/nilavu-pollster';
import {headerHeight} from 'nilavu/components/site-header';
import computed from "ember-addons/ember-computed-decorators";
import LaunchStatus from "nilavu/models/launch-status";

export default Ember.Controller.extend({

    clock: null,

    loading: false,

    deploySuccess: false,

    deployError: false,

    launchParked: true,

    deployPreError: false,

    nameEnabled: true,

    spinnerDeleteIn: false,

    spinnerCreateIn: false,

    title: I18n.t('launcher.predeployer'),

    activateVNC: false,

    unreadNotification: false,

    progressPosition: 1,

    maxProgressPosition: 100,

    createdAt: function() {
        return this.get('model.created_at');
    }.property('model.created_at'),

    modelType: function(){
        return this.get('model.__type');
    }.property('model.__type'),

    barHead: function() {
        if (this.deploySuccess) {

            this.set('barLabel', "Success, redirecting to management...");
            return 'success';
        }

        if (this.deployError || this.deployPreError) {
            this.set('barLabel', "Oops, try relaunching...");
            return 'danger';
        }
        this.set('barLabel', "Launching...");
        return 'none';
    }.property('progressPosition', 'streamPercentage'),

    id: Ember.computed.alias('model.id'),

    _initPoller: function() {
        this.set('notifications', []);
        this.set('clock', Clock.create());
    }.on('init'),

    @computed('model.postStream.posts')postsToRender() {
        return this.get('model.postStream.posts');
    },

    // Add the new notification into the model stream
    predeployNotificationChanged: function() {
        //state.notifications.map(n => this.attach('notification-item', n));
        const self = this;
        const deployLiveFeed = this.get('notifications');

        if (Ember.isEmpty(deployLiveFeed)) {
            return;
        };

        deployLiveFeed.forEach(feed => {
            const postStream = this.get('model.postStream');
            const events = feed.event_type.split('.')[2].toUpperCase();
            switch (events) {
              case LaunchStatus.TYPES_ACTION.PREERROR:
                  {
                      postStream.triggerNewPostInStream(feed).then(() => {
                          self.stopPolling();
                          self.appEvents.trigger('post-stream:refresh', {id: self.get('id')});
                          self.notificationMessages.error(I18n.t('launcher.not_launched'));
                          self.set('deployPreError', true);
                          NilavuURL.routeTo('/marketplaces');
                      });
                      break;
                  }
                  case LaunchStatus.TYPES.LAUNCHING:
                  case LaunchStatus.TYPES.LAUNCHED:
                  case LaunchStatus.TYPES.BOOTSTRAPPING:
                  case LaunchStatus.TYPES.BOOTSTRAPPED:
                  case LaunchStatus.TYPES.VNCHOSTUPDATING:
                  case LaunchStatus.TYPES.VNCHOSTUPDATED:
                  case LaunchStatus.TYPES.WAITUNTILL:
                  case LaunchStatus.TYPES.BOOTING:
                    {
                        if (Em.isEqual(events, LaunchStatus.TYPES.VNCHOSTUPDATED)) {
                            self.set('activateVNC', true);
                        }
                        postStream.triggerNewPostInStream(feed).then(() => {
                            self.appEvents.trigger('post-stream:refresh', {id: self.get('id')});
                        });
                        break;
                    }
                default:
                    {
                        Em.Logger.warn("unknown topic live feed type", feed);
                    }
            }
        });
    }.observes('unreadNotification'),

    subscribe: function() {
        // Unsubscribe before subscribing again
        this.unsubscribe();

        this.startPolling();
        this.startClocker();

        const pollster = this.get('pollster');

        if (pollster) {
            pollster.start();
        }
    },

    startPolling: function() {
        const self = this;
        if (Ember.isNone(this.get('pollster'))) {
            this.set('pollster', NilavuPollster.create({
                onPoll: function() {
                    self.refreshNotifications();
                }
            }));
        }
    },

    stopPolling: function() {
        this.get('pollster').stop();
    },

    startClocker: function() {
        if (this.get('clock')) {
            this.get('clock').start();
        }
    },

    refreshNotifications() {
        const category = this.constants.MARKETPLACE;

        const id = this.get('id');

        if (this.loading) {
            return;
        }
        // estimate (poorly) the amount of notifications to return
        let limit = Math.round(($(window).height() - headerHeight()) / 55);
        // we REALLY don't want to be asking for negative counts of notifications
        // less than 5 is also not that useful
        if (limit < 5) {
            limit = 5;
        }
        if (limit > 40) {
            limit = 40;
        }

        const stale = this.store.findStale('notification', {
            id: id,
            recent: true,
            limit,
            category: category.capitalize()
        }, {cacheKey: 'recent-notifications'});

        if (stale.hasResults) {
            const results = stale.results;
            let content = results.get('content');

            // we have to truncate to limit, otherwise we will render too much
            if (content && (content.length > limit)) {
                content = content.splice(0, limit);
                results.set('content', content);
                results.set('totalRows', limit);
            }
            this.set('notifications', results);
            this.toggleProperty('unreadNotification');
        } else {
            this.loading = true;
        }

        stale.refresh().then(notifications => {
            this.set('notifications', notifications);
            this.toggleProperty('unreadNotification');
        }).catch(() => {
            this.set('notifications', []);
            this.toggleProperty('unreadNotification');
        }). finally(() => {
            this.loading = false;
        });
    },

    unsubscribe() {
        if (this.get('pollster')) {
            this.stopPolling();
        }
        if (this.get('clock')) {
            this.get('clock').stop();
        }
        this.set('deploySuccess', false);
        this.set('deployError', false);
        this.set('progressPosition', 0);
    },

    getDeleteData() {
        return {
            id: this.get('model').id, account_id:this.get("model.topicTrackingState.currentUser.email"), cat_id: this.get('model').asms_id, name: this.get('model').name, action: "delete", cattype: this.get('model').tosca_type.split(".")[1],
            category: "state"
        };
    },

    delete() {
        var self = this;
        this.set('spinnerDeleteIn', true);
        Nilavu.ajax('/t/' + this.get('model').id + "/delete", {
            data: this.getDeleteData(),
            type: 'DELETE'
        }).then(function(result) {
            self.set('spinnerDeleteIn', false);
            if (result.success) {
                self.notificationMessages.success(I18n.t("vm_management.delete_success"));
                self.transitionToRoute("/");

            } else {
                self.notificationMessages.error(I18n.t("vm_management.error"));
            }
        }).catch(function() {
            self.set('spinnerDeleteIn', false);
            self.notificationMessages.error(I18n.t("vm_management.error"));
        });
    },

    actions: {

        destroy() {
            bootbox.confirm(I18n.t("vm_management.confirm_delete") + this.get('name') + I18n.t("vm_management.confirm_delete_suffix"), result => {
                if (result) {
                    this.delete();
                }
            });
        },
        // Called the the topmost visible post on the page changes.
        topVisibleChanged(event) {
            const {post, refresh} = event;

            if (!post) {
                return;
            }

            const postStream = this.get('model.postStream');
            const firstLoadedPost = postStream.get('posts.firstObject');

            const currentPostNumber = post.get('post_number');
            this.set('model.currentPost', currentPostNumber);
            this.send('postChangedRoute', currentPostNumber);

            if (post.get('post_number') === 1) {
                return;
            }

            if (firstLoadedPost && firstLoadedPost === post) {
                postStream.prependMore().then(() => refresh());
            }
        },

        //  Called the the bottommost visible post on the page changes.
        bottomVisibleChanged(event) {
            const {post, refresh} = event;

            const postStream = this.get('model.postStream');
            const lastLoadedPost = postStream.get('posts.lastObject');

            this.set('controllers.topic-predeploy.progressPosition', postStream.progressIndexOfPost(post));

            if (lastLoadedPost && lastLoadedPost === post && postStream.get('canAppendMore')) {
                postStream.appendMore().then(() => refresh());
                  refresh();
            }
        },

        toggleExpansion(opts) {
            this.toggleProperty('expanded');
            if (this.get('expanded')) {
                this.set('toPostIndex', this.get('progressPosition'));
                if (opts && opts.highlight) {
                    // TODO: somehow move to view?
                    Em.run.next(function() {
                        $('.jump-form input').select().focus();
                    });
                }
            }
        },

        jumpPost() {
            var postIndex = parseInt(this.get('toPostIndex'), 10);

            // Validate the post index first
            if (isNaN(postIndex) || postIndex < 1) {
                postIndex = 1;
            }
            if (postIndex > this.get('model.postStream.filteredPostsCount')) {
                postIndex = this.get('model.postStream.filteredPostsCount');
            }
            this.set('toPostIndex', postIndex);
            var stream = this.get('model.postStream'),
                postId = stream.findPostIdForPostNumber(postIndex);

            if (!postId) {
                Em.Logger.warn("jump-post code broken - requested an index outside the stream array");
                return;
            }

            var post = stream.findLoadedPost(postId);
            if (post) {
                this.jumpTo(this.get('model').urlForPostNumber(post.get('post_number')));
            } else {
                var self = this;
                // need to load it
                stream.findPostsByIds([postId]).then(function(arr) {
                    post = arr[0];
                    self.jumpTo(self.get('model').urlForPostNumber(post.get('post_number')));
                });
            }
        },

        jumpTop() {
            this.jumpTo(this.get('model.firstPostUrl'));
        },

        jumpBottom() {
            this.jumpTo(this.get('model.lastPostUrl'));
        }

    },

    streamPercentage: function() {
        return this.get('progressPosition');
    }.property('model.postStream.loaded', 'progressPosition', 'model.postStream.filteredPostsCount'),

    // Route and close the expansion
    jumpTo(url) {
        NilavuURL.routeTo(url);
    },

    jumpTopDisabled: function() {
        return this.get('progressPosition') <= 3;
    }.property('progressPosition'),

    filteredPostCountChanged: function() {
        const p = this.get('progressPosition');
        const f = this.get('model.postStream.filteredPostsCount');
        var s = p + f;

        if (s >= this.maxProgressPosition) {
            return this.set('progressPosition', this.maxProgressPosition);
        }

        this.set('progressPosition', s);

    }.observes('model.postStream.filteredPostsCount'),

    jumpToPostLaunch: function() {
        if (!this.get('deploySuccess')) {
            return;
        }

        Ember.run.debounce(this, () => {
            this.notificationMessages.success(I18n.t('launcher.launched_redirecting'));
            this.set('model.postStream.loading', false);
            this.set('progressPosition', this.maxProgressPosition);
        }, 1500);
    }.observes('deploySuccess'),

    stayOnPage: function() {
        if (!this.get('deployError') || this.get('launchParked')) {
            return;
        }
        Ember.run.debounce(this, () => {
            this.set('model.postStream.loading', false);
            this.set('progressPosition', this.maxProgressPosition);

        }, 1500);
    }.observes('deployError', 'launchParked'),

    OnPage: function() {
        if (!this.get('deployPreError')) {
            return;
        }

        Ember.run.debounce(this, () => {
            this.set('model.postStream.loading', false);
            this.set('progressPosition', this.maxProgressPosition);

        }, 1500);
    }.observes('deployPreError'),

    jumpBottomDisabled: function() {
        return this.get('progressPosition') >= this.get('model.postStream.filteredPostsCount') || this.get('progressPosition') >= this.get('model.highest_post_number');
    }.property('model.postStream.filteredPostsCount', 'model.highest_post_number', 'progressPosition'),

    hideProgress: function() {
        if (!this.get('model.postStream.loaded'))
            return true;
        if (!this.get('model.currentPost'))
            return true;
        if (this.get('model.postStream.filteredPostsCount') < 2)
            return true;
        return false;
    }.property('model.postStream.loaded', 'model.currentPost', 'model.postStream.filteredPostsCount'),

    hugeNumberOfPosts: function() {
        return (this.get('model.postStream.filteredPostsCount') >= Nilavu.SiteSettings.short_progress_text_threshold);
    }.property('model.highest_post_number'),

    jumpToBottomTitle: function() {
        if (this.get('hugeNumberOfPosts')) {
            return I18n.t('topic.progress.jump_bottom_with_number', {post_number: this.get('model.highest_post_number')});
        } else {
            return I18n.t('topic.progress.jump_bottom');
        }
    }.property('hugeNumberOfPosts', 'model.highest_post_number')

});
