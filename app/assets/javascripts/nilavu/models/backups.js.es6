import RestModel from 'nilavu/models/rest';
const Backups = RestModel.extend({});
Backups.reopenClass({
  list() {
    return Nilavu.ajax('/backups', {
      type: 'GET'
    }).then(function(result) {
      return result;
    });
  },

  listBackups(){
    return Nilavu.ajax('/admin/backups', {
      type: 'GET'
    }).then(function(result) {
      return result;
    });
  },

  show(params) {
    return Nilavu.ajax('/backup/'+params.backup_id , { type:'GET' });
  },

  showBackup(params){
    return Nilavu.ajax('/admin/backup/'+params.backup_id , { type:'GET' });
    }

});
export default Backups;
