export default Ember.Component.extend({
    tagName: 'tr',
    account_id: Ember.computed.alias('currentUser.email'),

    btnTitle: function() {
        return I18n.t("vm_management.backups.backup_title") + this.get('h.id');
    }.property(),

    getRemoveData(reqAction) {
        return {
            id: this.get('model').id,
            account_id: this.get("account_id"),
            asm_id: this.get('model').id,
            cat_id: this.get('h.id'),
            name: this.get('model').name,
            req_action: reqAction,
            cattype: this.get('model').tosca_type.split(".")[1],
            category: "backup",
            tosca_type: this.get('model.tosca_type')
        };
    },

    remove() {
        var self = this;
        this.set('spinnerRemoveIn', true);
        Nilavu.ajax('/t/' + this.get('h.asm_id') + "/remove", {
            data: this.getRemoveData("backupremove"),
            type: 'POST'
        }).then(function(result) {
            self.set('spinnerRemoveIn', false);
            if (result.success) {
                self.notificationMessages.success(I18n.t("vm_management.backups.backup_remove_success"));
                self.sendAction('refresh');
            } else {
                self.notificationMessages.error(I18n.t("vm_management.backups.backup_remove_error"));
            }
        }).catch(function() {
            self.set('spinnerRemoveIn', false);
            self.notificationMessages.error(I18n.t("vm_management.backups.backup_remove_error"));
        });
    },

    actions: {

        removeBackup() {
            bootbox.confirm(I18n.t("vm_management.confirm_delete") + this.get('h.id') + I18n.t("vm_management.confirm_delete_suffix"), result => {
                if (result) {
                    this.remove();
                }
            });
        }
    }
});
