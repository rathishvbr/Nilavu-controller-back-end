import {propertyNotEqual} from 'nilavu/lib/computed';
import {popupAjaxError} from 'nilavu/lib/ajax-error';

const AdminUser = Nilavu.User.extend({

    //customGroups: Em.computed.filter("groups", (g) => !g.automatic && Group.create(g)),
    //automaticGroups: Em.computed.filter("groups", (g) => g.automatic && Group.create(g)),

    canViewProfile: Ember.computed.or("active", "staged"),

    groupAdded(added) {
        return Nilavu.ajax("/admin/users/" + this.get('id') + "/groups", {
            type: 'POST',
            data: {
                group_id: added.id
            }
        }).then(() => this.get('groups').pushObject(added));
    },

    groupRemoved(groupId) {
        return Nilavu.ajax("/admin/users/" + this.get('id') + "/groups/" + groupId, {type: 'DELETE'}).then(() => this.set('groups.[]', this.get('groups').rejectBy("id", groupId)));
    },

    revokeApiKey() {
        return Nilavu.ajax("/admin/users/" + this.get('id') + "/revoke_api_key", {type: 'DELETE'}).then(() => this.set('api_key', null));
    },

    deleteAllPostsExplanation: function() {
        if (!this.get('can_delete_all_posts')) {
            if (this.get('deleteForbidden') && this.get('staff')) {
                return I18n.t('admin.user.delete_posts_forbidden_because_staff');
            }
            if (this.get('post_count') > Nilavu.SiteSettings.delete_all_posts_max) {
                return I18n.t('admin.user.cant_delete_all_too_many_posts', {count: Nilavu.SiteSettings.delete_all_posts_max});
            } else {
                return I18n.t('admin.user.cant_delete_all_posts', {count: Nilavu.SiteSettings.delete_user_max_post_age});
            }
        } else {
            return null;
        }
    }.property('can_delete_all_posts', 'deleteForbidden'),

    deleteAllPosts() {
        const user = this,
            message = I18n.t('admin.user.delete_all_posts_confirm', {
                posts: user.get('post_count'),
                topics: user.get('topic_count')
            }),
            buttons = [
                {
                    "label": I18n.t("composer.cancel"),
                    "class": "cancel-inline",
                    "link": true
                }, {
                    "label": '<i class="fa fa-exclamation-triangle"></i> ' + I18n.t("admin.user.delete_all_posts"),
                    "class": "btn btn-danger",
                    "callback": function() {
                        Nilavu.ajax("/admin/users/" + user.get('id') + "/delete_all_posts", {type: 'PUT'}).then(() => user.set('post_count', 0));
                    }
                }
            ];
        bootbox.dialog(message, buttons, {"classes": "delete-all-posts"});
    },

    revokeAdmin() {
        const self = this;
        return Nilavu.ajax("/admin/users/" + this.get('id') + "/revoke_admin", {type: 'PUT'}).then(function() {
            self.setProperties({admin: false, can_grant_admin: true, can_revoke_admin: false});
        });
    },

    grantAdmin() {
        const self = this;
        return Nilavu.ajax("/admin/users/" + this.get('id') + "/grant_admin", {type: 'PUT'}).then(function() {
            self.setProperties({admin: true, can_grant_admin: false, can_revoke_admin: true});
        }).catch(popupAjaxError);
    },

    revokeModeration() {
        const self = this;
        return Nilavu.ajax("/admin/users/" + this.get('id') + "/revoke_moderation", {type: 'PUT'}).then(function() {
            self.setProperties({moderator: false, can_grant_moderation: true, can_revoke_moderation: false});
        }).catch(popupAjaxError);
    },

    grantModeration() {
        const self = this;
        return Nilavu.ajax("/admin/users/" + this.get('id') + "/grant_moderation", {type: 'PUT'}).then(function() {
            self.setProperties({moderator: true, can_grant_moderation: false, can_revoke_moderation: true});
        }).catch(popupAjaxError);
    },

    refreshBrowsers() {
        return Nilavu.ajax("/admin/users/" + this.get('id') + "/refresh_browsers", {type: 'POST'}). finally(() => bootbox.alert(I18n.t("admin.user.refresh_browsers_message")));
    },

    approve() {
        const self = this;
        return Nilavu.ajax("/admin/users/" + this.get('id') + "/approve", {type: 'PUT'}).then(function() {
            self.setProperties({can_approve: false, approved: true, approved_by: Nilavu.User.current()});
        });
    },

    setOriginalTrustLevel() {
        this.set('originalTrustLevel', this.get('trust_level'));
    },

    dirty: propertyNotEqual('originalTrustLevel', 'trustLevel.id'),

    saveTrustLevel() {
        return Nilavu.ajax("/admin/users/" + this.id + "/trust_level", {
            type: 'PUT',
            data: {
                level: this.get('trustLevel.id')
            }
        }).then(function() {
            window.location.reload();
        }).catch(function(e) {
            let error;
            if (e.responseJSON && e.responseJSON.errors) {
                error = e.responseJSON.errors[0];
            }
            error = error || I18n.t('admin.user.trust_level_change_failed', {
                error: "http: " + e.status + " - " + e.body
            });
            bootbox.alert(error);
        });
    },

    restoreTrustLevel() {
        this.set('trustLevel.id', this.get('originalTrustLevel'));
    },

    lockTrustLevel(locked) {
        return Nilavu.ajax("/admin/users/" + this.id + "/trust_level_lock", {
            type: 'PUT',
            data: {
                locked: !!locked
            }
        }).then(function() {
            window.location.reload();
        }).catch(function(e) {
            let error;
            if (e.responseJSON && e.responseJSON.errors) {
                error = e.responseJSON.errors[0];
            }
            error = error || I18n.t('admin.user.trust_level_change_failed', {
                error: "http: " + e.status + " - " + e.body
            });
            bootbox.alert(error);
        });
    },

    canLockTrustLevel: function() {
        return this.get('trust_level') < 4;
    }.property('trust_level'),

    isSuspended: Em.computed.equal('suspended', true),
    canSuspend: Em.computed.not('staff'),

    suspendDuration: function() {
        const suspended_at = moment(this.suspended_at),
            suspended_till = moment(this.suspended_till);
        return suspended_at.format('L') + " - " + suspended_till.format('L');
    }.property('suspended_till', 'suspended_at'),

    log_out() {
        return Nilavu.ajax("/admin/users/" + this.id + "/log_out", {
            type: 'POST',
            data: {
                username_or_email: this.get('username')
            }
        }).then(function() {
            bootbox.alert(I18n.t("admin.user.logged_out"));
        });
    },

    impersonate() {
        return Nilavu.ajax("/admin/impersonate", {
            type: 'POST',
            data: {
                user_email: this.email,
                user_key: this.api_key
            }
        }).then(function() {
            document.location = Nilavu.getURL("/");
        }).catch(function(e) {
            if (e.status === 404) {
                bootbox.alert(I18n.t('admin.impersonate.not_found'));
            } else {
                bootbox.alert(I18n.t('admin.impersonate.invalid'));
            }
        });
    },

    deleteUser() {
     var self = this;
     const user = this,
         message = I18n.t("admin.user.delete.delete_confirm");

     const performDelete2 = function() {

         user.set('deletingUser', true);
         return Nilavu.ajax("/admin/users/" + user.id + "/delete", {
             data: {
                 user_email: user.email
             },
             type: 'DELETE'
         }).then(function(results) {
          if(results.success){
           document.location = Nilavu.getURL("/admin/users/list/active");
          }
          else {
           self.set("userNotDeleted", "show notokay");
          }
           user.set('deletingUser', false);
         });
     };

     const buttons = [
         {
             "label": I18n.t("admin.user.cancel"),
             "class": "cancel",
             "link": true
         }, {
             "label": '<i class="fa fa-exclamation-triangle"></i>' + I18n.t('admin.user.delete.delete_accept'),
             "class": "btn btn-danger",
             "callback": function() {
                 performDelete2();
             }
         }
     ];

     bootbox.dialog(message, buttons, {"classes": "delete-user-modal"});
    },

    addCredit() {
        this.set('creditingUser', true);
        this.set('creditStatus', false);
        var self = this;
        return Nilavu.ajax('/admin/users/' + this.id + '/credit', {
            data: {
                credit: this.credit,
                description: this.credit_description,
                account_id: this.email,
                api_key_details: this.api_key
            },
            type: 'PUT'
        }).then(function(results) {
            self.set('creditingUser', false);
            if (results.success) {
                self.set("styleToast", "show okay");
                self.toggleProperty('creditStatus');

            } else {
                self.set("errorMsg", results.message);
                self.set("styleToastFail", "show notokay");
            }

        });
    },

    activate() {
        return Nilavu.ajax('/admin/users/' + this.id + '/activate', {type: 'PUT'}).then(function() {
            window.location.reload();
        }).catch(function(e) {
            var error = I18n.t('admin.user.activate_failed', {
                error: "http: " + e.status + " - " + e.body
            });
            bootbox.alert(error);
        });
    },

    deactivate() {
        return Nilavu.ajax('/admin/users/' + this.id + '/deactivate', {type: 'PUT'}).then(function() {
            window.location.reload();
        }).catch(function(e) {
            var error = I18n.t('admin.user.deactivate_failed', {
                error: "http: " + e.status + " - " + e.body
            });
            bootbox.alert(error);
        });
    },

    unblock() {

        this.set('blockingUser', true);
        var self = this;

        return Nilavu.ajax('/admin/users/' + this.id + '/unblock', {
            data: {
                blocked: "false",
                email: this.email,
                api_key: this.api_key
            },
            type: 'PUT'
        }).then(function() {
            self.refreshUser(self.get('email')).then(function(result) {
                self.setProperties(result);

                self.set('blockingUser', false);
            });
        });
    },

    block() {

        const user = this,
            message = I18n.t("admin.user.block_confirm");

        const performBlock = function() {

            user.set('blockingUser', true);
            return Nilavu.ajax('/admin/users/' + user.id + '/block.json', {
                data: {
                    blocked: "true",
                    email: user.email,
                    api_key: user.api_key
                },
                type: 'PUT'
            }).then(function() {
                user.refreshUser(user.get('email')).then(function(result) {
                    user.setProperties(result);

                    user.set('blockingUser', false);
                });
            });
        };

        const buttons = [
            {
                "label": I18n.t("admin.user.cancel"),
                "class": "cancel",
                "link": true
            }, {
                "label": '<i class="fa fa-exclamation-triangle"></i>' + I18n.t('admin.user.block_accept'),
                "class": "btn btn-danger",
                "callback": function() {
                    performBlock();
                }
            }
        ];

        bootbox.dialog(message, buttons, {"classes": "delete-user-modal"});
    },

    suspend_state: function() {
        if (this.suspend.suspended === 'true') {
            return true;
        }
        return false;
    }.property('this'),

    block_states: function() {
        if (this.states.blocked === 'true') {
            return true;
        }
        return false;
    }.property('this'),

    suspended() {

        const user = this,
            message = I18n.t("admin.user.suspend_confirm");

        const performBlock2 = function() {

            user.set('suspendingUser', true);
            return Nilavu.ajax("/admin/users/" + user.id + "/suspend", {
                data: {
                    suspended: "true",
                    email: user.email,
                    api_key: user.api_key
                },
                type: 'PUT'
            }).then(function() {
                user.refreshUser(user.get('email')).then(function(result) {
                    user.setProperties(result);

                    user.set('suspendingUser', false);
                });
            });
        };

        const buttons = [
            {
                "label": I18n.t("admin.user.cancel"),
                "class": "cancel",
                "link": true
            }, {
                "label": '<i class="fa fa-exclamation-triangle"></i>' + I18n.t('admin.user.suspend_accept'),
                "class": "btn btn-danger",
                "callback": function() {
                    performBlock2();
                }
            }
        ];

        bootbox.dialog(message, buttons, {"classes": "delete-user-modal"});
    },

    unsuspend() {

        this.set('suspendingUser', true);
        var self = this;
        return Nilavu.ajax('/admin/users/' + this.id + '/unsuspend', {
            data: {
                suspended: "false",
                email: this.email,
                api_key: this.api_key
            },
            type: 'PUT'
        }).then(function() {
            self.refreshUser(self.get('email')).then(function(result) {
                self.setProperties(result);

                self.set('suspendingUser', false);
            });

        });
    },

    sendActivationEmail() {
        return Nilavu.ajax('/users/action/send_activation_email', {
            type: 'POST',
            data: {
                username: this.get('username')
            }
        }).then(function() {
            bootbox.alert(I18n.t('admin.user.activation_email_sent'));
        }).catch(popupAjaxError);
    },

    anonymizeForbidden: Em.computed.not("can_be_anonymized"),

    anonymize() {
        const user = this,
            message = I18n.t("admin.user.anonymize_confirm");

        const performAnonymize = function() {
            return Nilavu.ajax("/admin/users/" + user.get('id') + '/anonymize.json', {type: 'PUT'}).then(function(data) {
                if (data.success) {
                    if (data.username) {
                        document.location = Nilavu.getURL("/admin/users/" + user.get('id') + "/" + data.username);
                    } else {
                        document.location = Nilavu.getURL("/admin/users/list/active");
                    }
                } else {
                    bootbox.alert(I18n.t("admin.user.anonymize_failed"));
                    if (data.user) {
                        user.setProperties(data.user);
                    }
                }
            }).catch(function() {
                bootbox.alert(I18n.t("admin.user.anonymize_failed"));
            });
        };

        const buttons = [
            {
                "label": I18n.t("composer.cancel"),
                "class": "cancel",
                "link": true
            }, {
                "label": '<i class="fa fa-exclamation-triangle"></i>' + I18n.t('admin.user.anonymize_yes'),
                "class": "btn btn-danger",
                "callback": function() {
                    performAnonymize();
                }
            }
        ];

        bootbox.dialog(message, buttons, {"classes": "delete-user-modal"});
    },

    deleteForbidden: Em.computed.not("canBeDeleted"),

    deleteExplanation: function() {
        if (this.get('deleteForbidden')) {
            if (this.get('staff')) {
                return I18n.t('admin.user.delete_forbidden_because_staff');
            } else {
                return I18n.t('admin.user.delete_forbidden', {count: Nilavu.SiteSettings.delete_user_max_post_age});
            }
        } else {
            return null;
        }
    }.property('deleteForbidden'),

    destroy(opts) {
        const user = this,
            message = I18n.t("admin.user.delete_confirm"),
            location = document.location.pathname;

        const performDestroy = function(block) {
            let formData = {
                context: location
            };
            if (block) {
                formData["block_email"] = true;
                formData["block_urls"] = true;
                formData["block_ip"] = true;
            }
            if (opts && opts.deletePosts) {
                formData["delete_posts"] = true;
            }
            return Nilavu.ajax("/admin/users/" + user.get('id') + '.json', {
                type: 'DELETE',
                data: formData
            }).then(function(data) {
                if (data.deleted) {
                    if (/^\/admin\/users\/list\//.test(location)) {
                        document.location = location;
                    } else {
                        document.location = Nilavu.getURL("/admin/users/list/active");
                    }
                } else {
                    bootbox.alert(I18n.t("admin.user.delete_failed"));
                    if (data.user) {
                        user.setProperties(data.user);
                    }
                }
            }).catch(function() {
                AdminUser.find(user.get('id')).then(u => user.setProperties(u));
                bootbox.alert(I18n.t("admin.user.delete_failed"));
            });
        };

        const buttons = [
            {
                "label": I18n.t("composer.cancel"),
                "class": "btn",
                "link": true
            }, {
                "label": '<i class="fa fa-exclamation-triangle"></i>' + I18n.t('admin.user.delete_and_block'),
                "class": "btn btn-danger",
                "callback": function() {
                    performDestroy(true);
                }
            }, {
                "label": I18n.t('admin.user.delete_dont_block'),
                "class": "btn btn-primary",
                "callback": function() {
                    performDestroy(false);
                }
            }
        ];

        bootbox.dialog(message, buttons, {"classes": "delete-user-modal"});
    },

    deleteAsSpammer(successCallback) {
        const user = this;

        user.checkEmail().then(function() {
            const data = {
                posts: user.get('post_count'),
                topics: user.get('topic_count'),
                email: user.get('email') || I18n.t("flagging.hidden_email_address"),
                ip_address: user.get('ip_address') || I18n.t("flagging.ip_address_missing")
            };

            const message = I18n.t('flagging.delete_confirm', data),
                buttons = [
                    {
                        "label": I18n.t("composer.cancel"),
                        "class": "cancel-inline",
                        "link": true
                    }, {
                        "label": '<i class="fa fa-exclamation-triangle"></i> ' + I18n.t("flagging.yes_delete_spammer"),
                        "class": "btn btn-danger",
                        "callback": function() {
                            return Nilavu.ajax("/admin/users/" + user.get('id') + '.json', {
                                type: 'DELETE',
                                data: {
                                    delete_posts: true,
                                    block_email: true,
                                    block_urls: true,
                                    block_ip: true,
                                    delete_as_spammer: true,
                                    context: window.location.pathname
                                }
                            }).then(function(result) {
                                if (result.deleted) {
                                    if (successCallback)
                                        successCallback();
                                    }
                                else {
                                    bootbox.alert(I18n.t("admin.user.delete_failed"));
                                }
                            }).catch(function() {
                                bootbox.alert(I18n.t("admin.user.delete_failed"));
                            });
                        }
                    }
                ];

            bootbox.dialog(message, buttons, {"classes": "flagging-delete-spammer"});
        });
    },

    loadDetails() {
        const user = this;

        if (user.get('loadedDetails')) {
            return Ember.RSVP.resolve(user);
        }

        return AdminUser.find(self.get('email')).then(result => {
            user.setProperties(result);
            user.set('loadedDetails', true);
        });
    },

    /*tl3Requirements: function() {
    if (this.get('tl3_requirements')) {
      return TL3Requirements.create(this.get('tl3_requirements'));
    }
  }.property('tl3_requirements'),*/

    suspendedBy: function() {
        if (this.get('suspended_by')) {
            return AdminUser.create(this.get('suspended_by'));
        }
    }.property('suspended_by'),

    approvedBy: function() {
        if (this.get('approved_by')) {
            return AdminUser.create(this.get('approved_by'));
        }
    }.property('approved_by'),

    refreshUser(user_id) {
        const self = this;
        return Nilavu.ajax("/admin/users/" + user_id, {
            data: {
                email: self.email,
                api_key: self.api_key
            }
        }).then(function(result) {
            result.loadedDetails = true;
            self.updateFromJson(result.message);

        });
    },

    updateFromJson(result) {
        const self = this;
        const keys = Object.keys(result);
        keys.forEach(key => {
            self.set(key, result[key]);
        });
    }
});

AdminUser.reopenClass({

    bulkApprove(users) {
        _.each(users, function(user) {
            user.setProperties({approved: true, can_approve: false, selected: false});
        });

        return Nilavu.ajax("/admin/users/approve-bulk", {
            type: 'PUT',
            data: {
                users: users.map((u) => u.id)
            }
        }). finally(() => bootbox.alert(I18n.t("admin.user.approve_bulk_success")));
    },

    bulkReject(users) {
        _.each(users, function(user) {
            user.set('can_approve', false);
            user.set('selected', false);
        });

        return Nilavu.ajax("/admin/users/reject-bulk", {
            type: 'DELETE',
            data: {
                users: users.map((u) => u.id),
                context: window.location.pathname
            }
        });
    },

    find(user_mail, user_key) {
        return Nilavu.ajax("/admin/users/" + user_mail + "/" + user_key).then(result => {
            result.loadedDetails = true;
            return AdminUser.create(result.message);
        });
    },

    findAll(query, filter) {
        return Nilavu.ajax("/admin/users/list/" + query + ".json", {data: filter}).then(function(users) {
            return users.message.map((u) => AdminUser.create(u));
        });
    }
});

export default AdminUser;
