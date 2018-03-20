import Backups from 'nilavu/models/backups';
import showModal from 'nilavu/lib/show-modal';
import Ember from 'ember';
export default Ember.Controller.extend({
  backupsData: Ember.computed.alias('model.message.backups_all'),

  noOfBackups: function() {
    return this.get('backupsData.length');
  }.property('backupsData.length'),

  url:function(){
     return "backups.show" ;
   }.property(),


  actions: {

    upload() {
                showModal('backupObjectUpload', {
                    title: 'bucket.file',
                    smallTitle: true,
                    titleCentered: false,
                    close: true,
                    model: this.get('model'),
                    modalSize: "backup-upload-modal-size"

                });
            },

    refreshAfterDelete() {
      var self = this;
      Backups.show().then(function(result) {
        if (result.success) {
          self.set('backupsData', result.message.backups_all);
        } else {
          self.notificationMessages.error(I18n.t("vm_management.backups.list_error"));
        }
      }).catch(function() {
        self.notificationMessages.error(I18n.t("vm_management.backups.list_error"));
      });

    }
  },

});
