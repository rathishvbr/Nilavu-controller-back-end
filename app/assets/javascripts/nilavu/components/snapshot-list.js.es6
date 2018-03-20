export default Ember.Component.extend({

    tagName: 'tr',

    account_id: Ember.computed.alias('currentUser.email'),

    btnTitle: function() {
        return I18n.t("vm_management.snapshots.snapshot_title") + this.get('h.id');
    }.property(),

    btnsTitle: function() {
        return I18n.t("vm_management.snapshots.snapshot_restore") + this.get('h.id');
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
            category: "snapshot",
            tosca_type: this.get('model.tosca_type')
        };
    },

    getData(reqAction) {
        return {
            id: this.get('model').id,
            account_id: this.get("account_id"),
            asm_id: this.get('model').id,
            cat_id: this.get('h.id'),
            name: this.get('model').name,
            req_action: reqAction,
            cattype: this.get('model').tosca_type.split(".")[1],
            category: "snapshot",
            tosca_type: this.get('model.tosca_type')
        };
    },

    remove() {
        var self = this;
        this.set('spinnerRemoveIn', true);
        Nilavu.ajax('/t/' + this.get('h.asm_id') + "/remove", {
            data: this.getRemoveData("snapremove"),
            type: 'POST'
        }).then(function(result) {
            self.set('spinnerRemoveIn', false);
            if (result.success) {
                self.notificationMessages.success(I18n.t("vm_management.snapshots.snapshot_remove_success"));
                self.sendAction('refresh');
            } else {
                self.notificationMessages.error(I18n.t("vm_management.error"));
            }
        }).catch(function() {
            self.set('spinnerRemoveIn', false);
            self.notificationMessages.error(I18n.t("vm_management.error"));
        });
    },

    actions: {

        removeSnapshot() {
            bootbox.confirm(I18n.t("vm_management.confirm_delete") + this.get('h.id') + I18n.t("vm_management.confirm_delete_suffix"), result => {
                if (result) {
                    this.remove();
                }
            });
        },

        // saveSnapshot(){
        //   var self = this;
        //   this.set('spinnerRemoveIn', true);
        //   Nilavu.ajax('/t/' + this.get('h.asm_id') + "/restore", {
        //       data: this.getRemoveData("snapsave"),
        //       type: 'POST'
        //   }).then(function(result) {
        //       self.set('spinnerRemoveIn', false);
        //       if (result.success) {
        //           self.notificationMessages.success(I18n.t("vm_management.snapshots.snapshot_remove_success"));
        //           self.sendAction('refresh');
        //       } else {
        //           self.notificationMessages.error(I18n.t("vm_management.error"));
        //       }
        //   }).catch(function() {
        //       self.set('spinnerRemoveIn', false);
        //       self.notificationMessages.error(I18n.t("vm_management.error"));
        //   });
        //
        // },

        restoreSnapshot(){
          var self = this;
          this.set('spinnerRemoveIn', true);
          Nilavu.ajax('/t/' + this.get('h.asm_id') + "/save", {
              data: this.getData("snaprestore"),
              type: 'POST'
          }).then(function(result) {
              self.set('spinnerRemoveIn', false);
              if (result.success) {
                  self.notificationMessages.success(I18n.t("vm_management.snapshots.snapshot_restore_success"));
                  self.sendAction('refresh');
              } else {
                  self.notificationMessages.error(I18n.t("vm_management.error"));
              }
          }).catch(function() {
              self.set('spinnerRemoveIn', false);
              self.notificationMessages.error(I18n.t("vm_management.error"));
          });
        }
    }
});
