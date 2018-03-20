import NilavuURL from 'nilavu/lib/url';
import FilterProperties from 'nilavu/models/filter-properties';

export default Ember.Component.extend({
    error_title: function() {
        return I18n.t("vm_management.invalidvm.error");
    }.property(),

    delete() {
        var self = this;
        this.set('spinnerDeleteIn', true);
        Nilavu.ajax('/t/' + this.get('model').id + "/delete", {
            data: FilterProperties.getData(this.get('model'),'delete', 'state'),
            type: 'DELETE'
        }).then(function(result) {
            self.set('spinnerDeleteIn', false);
            if (result.success) {
                self.notificationMessages.success(I18n.t("vm_management.delete_success"));
                NilavuURL.redirectTo("/");
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
      }
});
