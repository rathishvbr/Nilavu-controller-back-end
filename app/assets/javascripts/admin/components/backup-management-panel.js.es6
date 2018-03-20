const BackupManagementPanel = Ember.Component.extend({
  classNameBindings: [':modal-tab', 'activeTab::invisible'],
});

export default BackupManagementPanel;

export function buildBackupManagementPanel(tab, extras) {
  return BackupManagementPanel.extend({
    activeTab: Ember.computed.equal('selectedTab', tab)
  }, extras || {});
}
