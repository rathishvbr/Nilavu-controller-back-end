import Backups from 'nilavu/models/backups';
export default Nilavu.Route.extend({

 model(params) {
   return Backups.show(params);
 },

    setupController(controller, model) {
        const backupsController = this.controllerFor('backups-show');
        backupsController.setProperties({model: model});
    },

    renderTemplate() {
        this.render('backups/show', {
            controller: 'backups-show',
            outlet: 'list-container'
        });


    }


});
