export default Ember.Component.extend({
    tagName: 'tr',

    getRemoveData(reqAction) {
     return {
      id: this.get('row.asm_id'),
      account_id: this.get("row.account_id"),
      asm_id: this.get('row.asm_id'),
      cat_id: this.get('row.id'),
      name: this.get('row.name'),
      req_action: reqAction,
      cattype: this.get('row.type').split(".")[1],
      category: "backup",
     };
    },

    actions: {


        delete() {
            var self = this;
            const user = this,
                message = I18n.t("admin.dashboard.launches.delete_confirm");


            const performDelete = function() {
                user.set('deletingMachine', true);
                return Nilavu.ajax('/t/' + user.get('row.asm_id') + "/remove",  {
                    data: user.getRemoveData("backupremove"),
                    type: 'POST'
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
