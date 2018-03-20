// use of user backup management page
// import AdminBackup from 'admin/models/admin-reports-show';
import Backups from 'nilavu/models/backups';


export default Nilavu.Route.extend({

 model() {
   return Backups.list();
 },

  setupController(controller, model) {
    const backupController = this.controllerFor('backupsList');
    backupController.setProperties({
      model: model
    });
  },

  renderTemplate() {

  this.render('backups-list', {
      controller: 'backups-list',
      outlet: 'list-container'
  });
 }
});
