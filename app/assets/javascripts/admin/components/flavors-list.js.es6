export default Ember.Component.extend({
      actions: {

        delete() {

            var self = this;
              const  message = I18n.t("admin.dashboard.launches.delete_confirm");
            const performDelete = function() {
                self.set('deletingFlavor', true);
                return Nilavu.ajax('/admin/flavors/' + self.get('flavors.id') + "/remove", {
                    data: {

                      id:self.get('flavors.id'),
                      name:self.get('flavors.name'),
                    },
                    type: 'DELETE'
                }).then(function(results) {

                    if (results.success) {

                        self.sendAction('refreshAfterAction');
                    } else {

                        self.set("NotDeleted", "show notokay");
                    }
                    self.set('deletingMachine', false);
                }).catch(function() {

                    self.set("NotDeleted", "show notokay");
                    self.set('deletingMachine', false);
                });
            };

            const buttons = [
                {
                    "label": I18n.t("admin..cancel"),
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
            bootbox.dialog(message, buttons, {"classes": "delete--modal"});

        }
    }

});
