export default Ember.Component.extend({
  tagName: 'tr',
    btnTitle: function() {
        return I18n.t("vm_management.disks.disk_title") + this.get('h.id');
    }.property(),

    getRemoveData() {
        return {disk_id: this.get('h.id'), asm_id: this.get('h.asm_id')};
    },

    remove() {
        var self = this;
        this.set('spinnerRemoveIn', true);
        Nilavu.ajax('/t/' + this.get('h.asm_id') + "/disk/volume/remove", {
            data: this.getRemoveData(),
            type: 'GET'
        }).then(function(result) {
            self.set('spinnerRemoveIn', false);
            if (result.success) {
                self.notificationMessages.success(I18n.t("vm_management.disks.disk_size_remove_success"));
                window.location.reload();
            } else {
                self.notificationMessages.error(I18n.t("vm_management.error"));
            }
        }).catch(function() {

            self.set('spinnerRemoveIn', false);
            self.notificationMessages.error(I18n.t("vm_management.error"));
        });
    },

    actions: {
        removeDisk() {
            bootbox.confirm(I18n.t("vm_management.confirm_delete") + this.get('h.id') + I18n.t("vm_management.confirm_delete_suffix"), result => {
                if (result) {
                    this.remove();
                }
            });
        }
    }
});
