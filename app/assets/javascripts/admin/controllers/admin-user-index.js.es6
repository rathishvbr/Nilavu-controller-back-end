import CanCheckEmails from 'nilavu/mixins/can-check-emails';
import {propertyNotEqual, setting} from 'nilavu/lib/computed';

export default Ember.Controller.extend(CanCheckEmails, {
    editingTitle: false,
    originalPrimaryGroupId: null,
    availableGroups: null,
    vall: false,
    // model: Em.computed.alias('model.message'),
    suspend: null,
    block: null,
    showCredit: false,
    format: /^[0-9]+$/,


    showApproval: setting('must_approve_users'),

    primaryGroupDirty: propertyNotEqual('originalPrimaryGroupId', 'model.primary_group_id'),

    findSuspend: function() {
        if (this.get("model.suspend.suspended") == "true") {
            this.set('suspend', true);
        } else {
            this.set('suspend', false);
        }
    }.observes("model.suspend.suspended"),

    creditSuccess: function() {
        if (this.get("model.creditStatus")) {
         this.set('credit', '');
         this.set('description', '');
        }
    }.observes("model.creditStatus"),

    findBlock: function() {
        if (this.get("model.states.blocked") == "true") {
            this.set('block', true);
        } else {

            this.set('block', false);

        }
    }.observes("model.states.blocked"),

    submitDisabled: function() {

        if (this.get('creditValidation.failed'))
            return true;

        return false;
    }.property('creditValidation.failed'),

    creditValidation: function() {
     if (Ember.isEmpty(this.get('credit'))) {
         return Nilavu.InputValidation.create({failed: true});
     }

        if (!this.get('credit').match(this.get('format'))) {
            return Nilavu.InputValidation.create({failed: true, reason: I18n.t('admin.user.credits_field_error')});
        }
    }.property('credit', 'format'),

    creditData: function() {
         this.set('model.credit', this.get('credit'));
         this.set('model.credit_description', this.get('description'));
    }.observes("credit", "description"),

    automaticGroups: function() {
        return this.get("model.automaticGroups").map((g) => g.name).join(", ");
    }.property("model.automaticGroups"),

    userFields: function() {
        const siteUserFields = this.site.get('user_fields'),
            userFields = this.get('model.user_fields');

        if (!Ember.isEmpty(siteUserFields)) {
            return siteUserFields.map(function(uf) {
                let value = userFields
                    ? userFields[uf.get('id').toString()]
                    : null;
                return {name: uf.get('name'), value: value};
            });
        }
        return [];
    }.property('model.user_fields.@each'),

    actions: {
     showCreditToggle(){this.set('showCredit', false);

    },
        toggleTitleEdit() {
            this.toggleProperty('editingTitle');
        },

        saveTitle() {
            const self = this;

            return Nilavu.ajax("/users/" + this.get('model.username').toLowerCase(), {
                data: {
                    title: this.get('model.title')
                },
                type: 'PUT'
            }).catch(function(e) {
                bootbox.alert(I18n.t("generic_error_with_reason", {
                    error: "http: " + e.status + " - " + e.body
                }));
            }). finally(function() {
                self.send('toggleTitleEdit');
            });
        },

        generateApiKey() {
            this.get('model').generateApiKey();
        },

        groupAdded(added) {
            this.get('model').groupAdded(added).catch(function() {
                bootbox.alert(I18n.t('generic_error'));
            });
        },

        groupRemoved(groupId) {
            this.get('model').groupRemoved(groupId).catch(function() {
                bootbox.alert(I18n.t('generic_error'));
            });
        },

        savePrimaryGroup() {
            const self = this;

            return Nilavu.ajax("/admin/users/" + this.get('model.id') + "/primary_group", {
                type: 'PUT',
                data: {
                    primary_group_id: this.get('model.primary_group_id')
                }
            }).then(function() {
                self.set('originalPrimaryGroupId', self.get('model.primary_group_id'));
            }).catch(function() {
                bootbox.alert(I18n.t('generic_error'));
            });
        },

        resetPrimaryGroup() {
            this.set('model.primary_group_id', this.get('originalPrimaryGroupId'));
        },

        regenerateApiKey() {
            const self = this;

            bootbox.confirm(I18n.t("admin.api.confirm_regen"), I18n.t("no_value"), I18n.t("yes_value"), function(result) {
                if (result) {
                    self.get('model').generateApiKey();
                }
            });
        },

        revokeApiKey() {
            const self = this;

            bootbox.confirm(I18n.t("admin.api.confirm_revoke"), I18n.t("no_value"), I18n.t("yes_value"), function(result) {
                if (result) {
                    self.get('model').revokeApiKey();
                }
            });
        },

        anonymize() {
            this.get('model').anonymize();
        },

        destroy() {
            this.get('model').destroy();
        }
    }

});
