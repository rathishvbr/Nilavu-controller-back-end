import ModalFunctionality from 'nilavu/mixins/modal-functionality';


export default Ember.Controller.extend(ModalFunctionality, {
  format: /^[0-9]+$/,
  addDiskSpinner: false,

  // You need a value in the field to submit it.

  submitDisabled: function() {

      if (this.get('sizeValidation.failed') || Ember.isEmpty(this.get('size')))
          return true;

      return false;
  }.property('sizeValidation.failed','size'),


  getData() {
      return {
          id: " ",
          asm_id: this.get('model').id,
          account_id: this.get("account_id"),
          size: this.get("size") + " GB",
          status: "inprogress"
      };
  },

  sizeValidation: function() {
   if (Ember.isEmpty(this.get('size'))) {
       return Nilavu.InputValidation.create({failed: true});
   }

      if (!this.get('size').match(this.get('format'))) {
          return Nilavu.InputValidation.create({failed: true, reason: I18n.t('vm_management.disks.validate_error')});
      }

  }.property('size', 'format'),

  actions: {
    submit: function() {
        var self = this;
        this.set('addDiskSpinner', true);
        Nilavu.ajax('/t/' + this.get('model').id + "/disk/volume/create", {
            data: this.getData(),
            type: 'POST'
        }).then(function(result) {

            self.set('addDiskSpinner', false);
            if (result.success) {
                self.notificationMessages.success(I18n.t("vm_management.disks.add_disk_success"));
            } else {
                // self.notificationMessages.error(I18n.t("vm_management.error"));
            }
            self.send("closeModal");
            window.location.reload();

        }).catch(function() {
            self.set('addDiskSpinner', false);
            // self.notificationMessages.error(I18n.t("vm_management.error"));
            self.send("closeModal");
        });
    }
  }

});
