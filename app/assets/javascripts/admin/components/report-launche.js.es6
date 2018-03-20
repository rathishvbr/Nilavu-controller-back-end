export default Ember.Component.extend({
    tagName: 'tr',
    actions: {

        delete() {
            var self = this;
            const user = this,
                message = I18n.t("admin.dashboard.launches.delete_confirm");

            const performDelete = function() {
                self.sendAction('refreshAfterAction');

                user.set('deletingMachine', true);
                return Nilavu.ajax("/admin/users/" + user.get('row.id') + "/delete_instance", {
                    data: {

                        id: user.get('row.id'),
                        asms_id: user.get('row.asms_id')
                    },
                    type: 'DELETE'
                }).then(function(results) {
                    if (results.success) {
                        self.sendAction('refreshAfterAction');
                    } else {
                        self.set("NotDeleted", "show notokay");
                    }
                    user.set('deletingMachine', false);
                }).catch(function() {
                    self.set("NotDeleted", "show notokay");
                    user.set('deletingMachine', false);
                });
            };

            const buttons = [
                {
                    "label": I18n.t("admin.user.cancel"),
                    "class": "cancel",
                    "link": true
                }, {
                    "label": '<i class="fa fa-exclamation-triangle"></i>' + I18n.t('admin.dashboard.launches.delete_accept'),
                    "class": "btn btn-danger",
                    "callback": function() {
                        performDelete();
                    }
                }
            ];
            bootbox.dialog(message, buttons, {"classes": "delete-user-modal"});

        }
    }

});
