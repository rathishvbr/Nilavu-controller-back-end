import FilterProperties from 'nilavu/models/filter-properties';
import NilavuURL from 'nilavu/lib/url';
export default Ember.Controller.extend({
  backupArray: Ember.computed.alias('model.message.backups_per'),
  selectedTab: null,
  buttonDisabled: true,
  panels: null,
  needs: [
    'application', 'modal'
  ],

  _initPanels: function() {
    this.set('panels', []);
    this.set('selectedTab', 'info');
  }.on('init'),

  backup: function() {
    if (!this.get('backupArray')) {
      return;
    }
    return this.get('backupArray').objectAt(0);
  }.property('backupArray'),

  noneToShow: function() {
    return (Ember.isEmpty(this.get('backup')));
  }.property('backup'),


  name: function() {
    return this.get('backup.name');
  }.property('backup.name'),

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


  downloadDisabled: function() {
    var downloadObjectUrl = FilterProperties.byKey(this.get('backup.outputs'), "downloadUrl");
    this.set("downloadPresignedUrl", downloadObjectUrl);
    return Ember.isEmpty(downloadObjectUrl) ? true : false;
  }.property('backup.outputs'),

  actions: {

    download: function() {
      NilavuURL.redirectTo(this.get('downloadPresignedUrl'));
    },

    refresh: function() {

      var self = this;
      this.set("showRefreshSpinner", true);
      Nilavu.ajax("/admin/" + this.get('backup').id + "/backups/list/all", {
        type: 'GET'
      }).then(function(result) {
        self.set("showRefreshSpinner", false);
        if (result.success) {
          self.set('backups', result.message.backups_all);
        } else {
          self.notificationMessages.error(I18n.t("vm_management.backups.list_error"));
        }
      }).catch(function() {
        self.set("showRefreshSpinner", false);
        self.notificationMessages.error(I18n.t("vm_management.backups.list_error"));
      });
    },

    delete: function() {

      var self = this;
      this.set('showDeleteSpinner', true);
      Nilavu.ajax('/t/' + this.get('backup.asm_id') + "/remove", {
        data: this.getRemoveData("backupremove"),
        type: 'POST'
      }).then(function(result) {
        self.set('showDeleteSpinner', false);
        if (result.success) {
          self.notificationMessages.success(I18n.t("vm_management.backups.backup_remove_success"));
          NilavuURL.redirectTo('/admin/settings/backups');
        } else {
          self.notificationMessages.error(I18n.t("vm_management.backups.backup_remove_error"));
        }
      }).catch(function() {
        self.set('showDeleteSpinner', false);
        self.notificationMessages.error(I18n.t("vm_management.backups.backup_remove_error"));
      });
    },


  }

});
