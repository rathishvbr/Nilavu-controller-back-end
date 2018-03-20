import {buildCategoryPanel} from 'nilavu/components/edit-category-panel';
import FilterProperties from 'nilavu/models/filter-properties';

export default buildCategoryPanel('keys', {
    privateKey_suffix: ".key",
    publicKey_suffix: ".pub",
    spinnerprivateIn: false,
    spinnerpublicIn: false,
    privatekeyType: "PRIVATEKEY",
    publickeyType: "PUBLICKEY",
    privatekey: 'application/x-pem-key',
    publickey: 'text/plain',
    bysshKey: true,
    loading: false,

    passwordConfirmValidation: function() {
        if (!Ember.isEmpty(this.get('retypePassword')) && this.get('newPassword') === this.get('retypePassword')) {
            return Nilavu.InputValidation.create({ok: true, reason: I18n.t('user.password.confirm')});
        }

        if (!Ember.isEmpty(this.get('retypePassword')) && this.get('newPassword') !== this.get('retypePassword')) {
            return Nilavu.InputValidation.create({failed: true, reason: I18n.t('user.password.confirmpwd')});
        }

    }.property('retypePassword', 'newPassword'),

    content_sshkey_name: function() {
        return I18n.t("vm_management.keys.content_name");
    }.property(),

    content_root_pwd_title: function() {
        return I18n.t("vm_management.keys.root_password_title");
    }.property(),

    hint_ssh: function() {
        return I18n.t("vm_management.keys.sshkey_info");
    }.property(),

    hint_ssh_suffix: function() {
        return I18n.t("vm_management.keys.sshkey_info_suffix");
    }.property(),

    hint_ssh_i: function() {
        return I18n.t("vm_management.keys.sshkey_info_sshkeys");
    }.property(),

    hint_ssh_suffix_i: function() {
        return I18n.t("vm_management.keys.sshkey_info_suffix_sshkeys");
    }.property(),

    content_root_pwd_content: function() {
        return I18n.t("vm_management.keys.root_password_content");
    }.property(),

    content_sshkey_title: function() {
        return I18n.t("vm_management.keys.sshkey_title");
    }.property(),

    content_sshkey_content: function() {
        return I18n.t("vm_management.keys.sshkey_content");
    }.property(),

    content_sshkey_content_extension: function() {
        return I18n.t("vm_management.keys.sshkey_content_extension");
    }.property(),

    content_private_sshkey: function() {
        return I18n.t("vm_management.keys.content_private_sshkey");
    }.property(),

    content_public_sshkey: function() {
        return I18n.t("vm_management.keys.content_public_sshkey");
    }.property(),

    keys_title: function() {
        return I18n.t("vm_management.keys.keys_title");
    }.property(),

    privateKey: function() {
        return FilterProperties.byKey(this.get('model.inputs'), "sshkey");
    }.property('model.inputs'),

    publicKey: function() {
        return FilterProperties.byKey(this.get('model.inputs'), "sshkey");
    }.property('model.inputs'),

    root_username: function() {
        return FilterProperties.byKey(this.get('model.inputs'), "root_username");
    }.property('model.inputs'),

    byRootUserName: function() {
        if (!Em.isEmpty(this.get("root_username"))) {
            this.set("bysshKey", false);
            return true;
        }
        return false;
    }.property('root_username', 'bysshKey'),

    showPrivateSpinner: function() {
        return this.get('spinnerprivateIn');
    }.property('spinnerprivateIn'),

    showPublicSpinner: function() {
        return this.get('spinnerpublicIn');
    }.property('spinnerpublicIn'),

    _getSuffix(type) {
        if (type === this.get('privatekeyType')) {
            return this.get('privateKey_suffix');
        } else {
            return this.get('publicKey_suffix');
        }
    },

    _getKey(name) {
        return Nilavu.ajax("/ssh_keys/" + name + ".json", {type: 'GET'});
    },

    resetField() {
        this.setProperties({currentPassword: '', newPassword: '', retypePassword: ''});
    },

    getRequesteData() {
        return {
            id: this.get('model').id, account_id: this.get("model.topicTrackingState.currentUser.email"), cat_id: this.get('model').id, name: this.get('model.name'), cattype: this.get('model').tosca_type.split(".")[1],
            category: "operations",
            req_action: "resetpassword"

        };
    },

    getData() {
        var self = this;
        return {
            root_password: self.get('retypePassword'),
            id: this.get('model').id,
            asm_id: self.get('model').id,
            name: self.get('model').name,
            components: self.get('model.components'),
            tosca_type: self.get('model.tosca_type'),
            policies: self.get('model.policies'),
            inputs: self.get('model.inputs'),
            outputs: self.get('model.outputs'),
            state: self.get('model.state'),
            status: self.get('model.status.message'),
            created_at: self.get('model.created_at'),
            account_id: self.get("model.topicTrackingState.currentUser.email")
        };
    },

    actions: {

        download(key, type) {
            var self = this;
            this.set('spinner' + key + 'In', true);
            return self._getKey(key).then(function(result) {
                self.set('spinner' + key + 'In', false);
                if (!result.failed) {
                    var blob = null;
                    if (type === self.get('privatekeyType')) {
                        blob = new Blob([result.message.ssh_keys[0].privatekey], {type: self.get('privatekey')});
                    } else {
                        blob = new Blob([result.message.ssh_keys[0].publickey], {type: self.get('publickey')});
                    }
                    Nilavu.saveAs(blob, key + self._getSuffix(type));
                } else {
                    self.notificationMessages.error(result.message);
                }
            }, function() {
                self.set('spinner' + key + 'In', false);
                return self.notificationMessages.error(I18n.t("ssh_keys.download_error"));
            });
        },

        changePwd() {
            const self = this;
            self.set('loading', true);

            if (Ember.isEmpty(this.get('newPassword')) || Ember.isEmpty(this.get('retypePassword'))) {
                this.notificationMessages.error(I18n.t('user.password.blank_password'));
                self.set('loading', false);
                self.set('formSubmitted', false);
                return;
            }
            Nilavu.ajax("/ssh_keys/password", {
                data: self.getData(),
                type: 'PUT'
            }).then(function(result) {
                if (result.success) {
                    Nilavu.ajax('/t/' + self.get('model').id + "/resetpassword", {
                        data: self.getRequesteData(),
                        type: 'POST'
                    }).then(function(results) {
                        if (results.success) {
                            self.notificationMessages.success(I18n.t('user.change_password.reset'));
                        } else {
                            self.notificationMessages.error(I18n.t('user.change_password.root_resetfail'));
                        }
                    });

                } else {
                    self.notificationMessages.error(I18n.t('user.change_password.root_resetfail'));
                }
                self.set('loading', false);
                self.resetField();
            });
        }

    }

});
