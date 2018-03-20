import AdminUser from 'admin/models/admin-user';

export default Nilavu.Route.extend({
    serialize( model ) {
        return {api_key: model.get( 'api_key' ), email: model.get( 'email' )};
    },

    model( params ) {
        return AdminUser.find(Em.get( params, 'email' ), Em.get( params, 'api_key' ));
    },

    renderTemplate( ) {
        this.render({ into: 'admin' });
    }
});
