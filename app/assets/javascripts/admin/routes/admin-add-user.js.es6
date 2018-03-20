//import AdminAdduser from 'admin/models/admin-add-user';

export default Nilavu.Route.extend({

    model() {
      // alert("enter adduser model")
       //return AdminAdduser.reload();

      return ;
    },

    setupController: function(controller, model) {
      const adduserController = this.controllerFor('adminAddUser');
        adduserController.setProperties({model: model});
    },
    renderTemplate() {
            this.render({into: 'admin', controller: 'admin-add-user'});
    }
});
