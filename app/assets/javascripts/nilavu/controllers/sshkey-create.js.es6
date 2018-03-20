import ModalFunctionality from 'nilavu/mixins/modal-functionality';
export default Ember.Controller.extend(ModalFunctionality, {
    needs: ['modal'],
    createButton: true,
    spinnerIn: false,

    onShow: function() {
        this.set('controllers.modal.modalClass', 'ssh-modal');
    },

    placeHolder: function() {
        return I18n.t("ssh_keys.temp_name");
    }.property(),

    submitDisabled: function() {
        if (this.get('sshKeyCreateName'))
            return false;
        return true;
    }.property('sshKeyCreateName'),

    showSpinner: function() {
        return this.get('spinnerIn');
    }.property('spinnerIn'),

    actions: {
        create() {
            var self = this;
            this.set('spinnerIn', true);

            Nilavu.ajax('/ssh_keys', {
                data: {
                    keypairname: this.get('sshKeyCreateName').trim()
                },
                type: 'POST'
            }).then(function(result) {
                self.set('spinnerIn', false);
                self.send("closeModal");
                if (result.success) {
                    self.get('model').reload().then(function() {
                        self.notificationMessages.success(I18n.t('ssh_keys.create_success'));
                    }).catch(function() {
                        self.notificationMessages.error(I18n.t("ssh_keys.reload_error"));
                    });
                } else {
                    self.notificationMessages.error(I18n.t('ssh_keys.create_error'));
                }
            }).catch(function() {
                self.set('spinnerIn', false);
                self.send("closeModal");
                self.notificationMessages.error(I18n.t("ssh_keys.create_error"));
            });
        }
    }
});
