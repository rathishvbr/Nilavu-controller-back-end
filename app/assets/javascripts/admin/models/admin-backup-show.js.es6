import RestModel from 'nilavu/models/rest';
const AdminBackup = RestModel.extend({
  reload(params) {
      const self = this;
      return Nilavu.ajax('/backup/' + params.backup_id, {type: 'GET'}).then(function(backup_json) {
          self.updateFromJson(backup_json);
      });
  },
  updateFromJson(json) {
      const self = this;
      self.set('details', json);

      const keys = Object.keys(json);

      keys.forEach(key => {
          self.set(key, json[key]);
      });
  },
  
});
AdminBackup.reopenClass({});
export default AdminBackup;
