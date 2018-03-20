import ModalFunctionality from 'nilavu/mixins/modal-functionality';
export default Ember.Controller.extend(ModalFunctionality, {
    needs: ['modal'],
    spinnerIn: false,
    fileuploaders: [],
    object: null,

    onShow() {
        this.set('controllers.modal.modalClass', 'full');
    },

    makeid: function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    },

    actions: {
        startUpload() {
            this.get('fileuploaders').pushObject(Ember.Object.create({
              bucket_name: this.get('bucketName'),
              access_key: this.get('access_key'),
              secret_key: this.get('secret_key'),
              server: this.get('server'),
              https: this.get('https'),
              id: this.makeid()
            }));
        },

        done() {
          var self = this;
          self.get('model').reload(self.get('bucketName')).then(function() {
          }).catch(function() {
            self.notificationMessages.success(I18n.t('bucket.storage_refresh_error'));
          });
          self.send("closeModal");
        }
    }
});
