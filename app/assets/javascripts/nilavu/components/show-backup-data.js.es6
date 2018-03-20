
import FilterProperties from 'nilavu/models/filter-properties';
export default Ember.Component.extend({
  tagName: 'tr',
  noUrlTitle: 'No url found',
  showBrandImage: function() {
    var fullBrandUrl = this.get('backup.tosca_type');

    if (Em.isNone(fullBrandUrl)) {
      return `<img src="/images/brands/dummy.png" />`.htmlSafe();
    }

    const split = fullBrandUrl.split('.');

    if (split.length >= 2) {
      var brandImageUrl = split[2].trim().replace(/\s/g, '');
      return `<img src="/images/brands/${brandImageUrl}.png" />`.htmlSafe();
    }

    return `<img src="/images/icons/ubuntu.png" />`.htmlSafe();
  }.property('backup'),

  getRemoveData(reqAction) {
    return {
      id: this.get('backup.id'),
      account_id: this.get("backup.account_id"),
      asm_id: this.get('backup.asm_id'),
      cat_id: this.get('backup.id'),
      name: this.get('backup.name'),
      req_action: reqAction,
      cattype: this.get('backup.tosca_type').split(".")[1],
      category: "backup",
    };
  },

  downloadUrl: function(){
  var downloadObjectUrl = FilterProperties.byKey(this.get('backup.outputs'), "downloadUrl");
  this.set("downloadPresignedUrl", downloadObjectUrl);
  return Ember.isEmpty(downloadObjectUrl) ? false : true;
}.property('backup.outputs'),

  actions: {
    delete() {
      var self = this;
      const user = this,
        message = I18n.t("admin.dashboard.launches.delete_confirm");


      const performDelete = function() {
        user.set('deletingBackup', true);
        return Nilavu.ajax('/t/' + user.get('backups.id') + "/remove", {
          data: user.getRemoveData("backupremove"),
          type: 'POST'
        }).then(function(results) {
          user.set('deletingBackup', false);
          if (results.success) {
            self.notificationMessages.success(I18n.t("vm_management.backups.backup_remove_success"));
            self.sendAction('refreshAfterAction');
          } else {
            self.notificationMessages.error(I18n.t("vm_management.backups.backup_remove_error"));
          }
        }).catch(function() {});
      };

      const buttons = [{
        "label": I18n.t("admin.user.cancel"),
        "class": "cancel",
        "link": true
      }, {
        "label": '<i class="fa fa-exclamation-triangle"></i>' + I18n.t('admin.dashboard.launches.delete_accept'),
        "class": "btn btn-danger",
        "callback": function() {
          performDelete();
        }
      }];
      bootbox.dialog(message, buttons, {
        "classes": "delete-user-modal"
      });

    }
  }

});
