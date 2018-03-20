import {
  buildBackupManagementPanel
} from 'admin/components/backup-management-panel';
import FilterProperties from 'nilavu/models/filter-properties';
import {
  formatFileSize
} from 'nilavu/helpers/file-formats';
export default buildBackupManagementPanel('info', {

  accountId: function() {
    return this.get('backup.account_id');
  }.property('backup.account_id'),

  id: function() {
    return this.get('backup.id');
  }.property('backup.id'),

  name: function() {
    return this.get('backup.name');
  }.property('backup.name'),

  status: function() {
    return this.get('backup.status');
  }.property('backup.status'),

  createdAt: function() {
    return this.get('backup.created_at');
  }.property('backup.created_at'),

  region: function() {
    return FilterProperties.byKey(this.get('backup.inputs'), "region");
  }.property('backup.inputs'),

  path: function() {
    return this.get('model.message.backups_per.path');
  }.property('model.message.backups_per.path'),

  size: function() {
    let size = FilterProperties.byKey(this.get('backup.outputs'), "size");
    return Ember.isEmpty(size) ? formatFileSize(parseInt(0)) : formatFileSize(parseInt(size));

  }.property('backup.outputs'),





});
