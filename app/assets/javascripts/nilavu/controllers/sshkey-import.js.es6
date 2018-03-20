import ModalFunctionality from 'nilavu/mixins/modal-functionality';
export default Ember.Controller.extend(ModalFunctionality, {
    createButton: true,
    spinnerIn: false,
    sshPrivateKeyValue: null,
    sshPublicKeyValue: null,

    onShow: function() {
        this.set('controllers.modal.modalClass', 'ssh-modal');
    },

    placeHolder: function() {
        return I18n.t("ssh_keys.temp_name");
    }.property(),

    submitDisabled: function() {
        if (this.get('sshKeyImportName'))
            return false;
        return true;
    }.property('sshKeyImportName'),

    showSpinner: function() {
        return this.get('spinnerIn');
    }.property('spinnerIn'),

    actions: {
        sshkey_import() {
            var self = this;
            this.set('spinnerIn', true);
            if (Ember.isEmpty(self.get('sshPublicKeyValue'))) {
                self.notificationMessages.error(I18n.t("ssh_keys.import_empty_file_error"));
                self.set('spinnerIn', false);
                return;
            }
            Nilavu.ajax('/ssh_keys/import', {
                data: {
                    keypairname: self.get('sshKeyImportName').trim(),
                    ssh_private_key:" ",
                    ssh_public_key: self.get('sshPublicKeyValue')
                },
                type: 'POST'
            }).then(function(result) {
                self.set('spinnerIn', false);
                self.send("closeModal");
                if (result.success) {
                    self.get('model').reload().then(function() {
                        self.notificationMessages.success(I18n.t("ssh_keys.import_success"));
                    }).catch(function() {
                        self.notificationMessages.error(I18n.t("ssh_keys.reload_error"));
                    });
                } else {
                    self.notificationMessages.error(I18n.t("ssh_keys.import_error"));
                }
            }).catch(function() {
                self.set('spinnerIn', false);
                self.send("closeModal");
                self.notificationMessages.error(I18n.t("ssh_keys.import_error"));
            });
        }
    }
});
