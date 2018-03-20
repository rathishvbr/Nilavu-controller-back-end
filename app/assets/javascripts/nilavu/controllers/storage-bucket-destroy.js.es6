import ModalFunctionality from 'nilavu/mixins/modal-functionality';
export default Ember.Controller.extend(ModalFunctionality, {
    needs: ['modal'],
    spinnerIn: false,

    showSpinner: function() {
        return this.get('spinnerIn');
    }.property('spinnerIn'),


    actions: {

        destroy() {
          var self = this;
          this.set('spinnerIn', true);

          Nilavu.ajax('/buckets/'+this.get('bucketName'), {
              data: {
                  bucket_name: this.get('bucketName')
              },
              type: 'DELETE'
          }).then(function(result) {
              self.set('spinnerIn', false);
              if (result.success) {
                  self.notificationMessages.success(I18n.t('bucket.bucket_destroy_success'));
                  self.get('model').reload(self.get('bucketName')).then(function() {
                  }).catch(function() {
                    self.notificationMessages.success(I18n.t('bucket.storage_refresh_error'));
                  });
                  self.send("closeModal");

              } else {
                  self.send("closeModal");
                  self.notificationMessages.error(I18n.t('bucket.bucket_destroy_error'));
              }
          });
        },

    }
});
