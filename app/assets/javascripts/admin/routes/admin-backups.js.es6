import Backups from 'nilavu/models/backups';
export default Nilavu.Route.extend({

    model() {
      return Backups.listBackups();
    },

    setupController(controller, model) {
        const backupsController = this.controllerFor('admin-backups');
        backupsController.setProperties({model});
    },

    renderTemplate() {
        this.render({into:'admin', controller: 'admin-backups'});


    }


});
