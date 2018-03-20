import {buildBackupManagementPanel} from 'admin/components/backup-management-panel';
import FilterProperties from 'nilavu/models/filter-properties';
export default buildBackupManagementPanel('shared', {
  labelsShareSelected: false,
  publicShareSelected: false,
  labelValue: [],

  _init: function() {
    this.getUserData();

  }.on('init'),



  getUserData: function() {
    var self = this;
    return Nilavu.ajax('/admin/users/list/active', {
      type: 'GET'
    }).then(function(result) {

      if (result.message) {
        self.set("users", result.message);

      }
    });

  },



});
