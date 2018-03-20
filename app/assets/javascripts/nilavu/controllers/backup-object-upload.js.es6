import ModalFunctionality from 'nilavu/mixins/modal-functionality';
import Backups from 'nilavu/models/backups';
export default Ember.Controller.extend(ModalFunctionality, {
  needs: ['modal'],
  spinnerIn: false,
  fileuploaders: [],
  object: null,
  accountId: Ember.computed.alias('currentUser.email'),

  bucketName: Ember.computed.alias('model.storageDetails.storage_bucket'),
  server: Ember.computed.alias('model.storageDetails.storage_user_endpoint'),
  accessKey: Ember.computed.alias('model.storageDetails.storage_user_access_key'),
  secretKey: Ember.computed.alias('model.storageDetails.storage_user_secret_key'),
  physicalLocation: Ember.computed.alias('model.storageDetails.storage_user_physical_location'),
  uploadProgress: true,

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

  updateGateway() {
    var self = this;
    var id = "id";
    Nilavu.ajax('/admin/' + id + "/backup/create", {
      data: self.getData(),
      type: 'POST'
    }).then(function(result) {
      if (result.success) {
        self.notificationMessages.success(I18n.t("vm_management.backups.take_backup_success"));
      } else {
        self.notificationMessages.error(I18n.t("vm_management.backups.take_backup_error"));
      }
    }).catch(function() {
      self.notificationMessages.error(I18n.t("vm_management.backups.take_backup_error"));
    }).finally(function() {
      window.location.reload();
    });
  },

  presignedURL(bucket, key) {

    var self = this;
    Nilavu.ajax('/admin/backups/file/' + bucket, {
      type: 'GET',
      data: {
        key: key
      }
    }).then(function(result) {
      self.set('objectURL', result.message);
      self.updateGateway();
    });
  },

  getData() {
    var inputs = [{
      key: 'region',
      value: this.get('subRegionOption')
    }, {
      key: 'public_url',
      value: this.get('objectURL')
    }];
    return {
      account_id: this.get("accountId"),
      name: this.get('filekey'),
      asm_id: "null",
      inputs: JSON.stringify(inputs),
      status: this.constants.INPROGRESS,
      tosca_type: "vertice.torpedo.backup"
    };
  },

  actions: {
    startUpload() {
      this.get('fileuploaders').pushObject(Ember.Object.create({
        bucket_name: this.get('bucketName'),
        access_key: this.get('accessKey'),
        secret_key: this.get('secretKey'),
        server: this.get('server'),
        id: this.makeid()
      }));
      this.set('objectCount', true);
    },

    done() {
      this.set('objectURL',this.get('physicalLocation')+"/"+this.get('bucketName')+"/"+this.get('filekey') );
      this.updateGateway();
      // this.presignedURL(this.get('bucketName'), this.get('filekey'));
    }
  }
});
