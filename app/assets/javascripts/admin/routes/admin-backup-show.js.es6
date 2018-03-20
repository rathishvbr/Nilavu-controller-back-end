 export default Nilavu.Route.extend({
   model(params) {
     var self=this;
     const backup = this.store.createRecord('admin-backup-show');
     return backup.reload(params).then(function() {
         self.set('loading', false);
         return backup;
     }).catch(function() {
         self.set('loading', false);
     });

   },

   setupController(controller, model) {
     const backupController = this.controllerFor('adminBackupShow');
     backupController.setProperties({
       model: model
     });
   },

   renderTemplate() {
     this.render({
       into: 'admin',
       controller: 'admin-backup-show'
     });
   }
 });
