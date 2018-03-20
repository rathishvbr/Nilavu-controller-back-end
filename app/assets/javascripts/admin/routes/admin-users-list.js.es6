import AdminUser from 'admin/models/admin-user';

export default Nilavu.Route.extend({

  actions: {
    exportUsers() {
    },

    sendInvites() {
      this.transitionTo('userInvited', Nilavu.User.current());
    },

    deleteUser(user) {
      AdminUser.create(user).destroy({ deletePosts: true });
    }
  }

});
