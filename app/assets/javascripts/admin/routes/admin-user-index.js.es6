import showModal from 'nilavu/lib/show-modal';

export default Nilavu.Route.extend({
    model( ) {
        return this.modelFor( 'adminUser' );
    },

    setupController( controller, model ) {
        controller.setProperties({ model });
    },

    actions: {
        showSuspendModal( model ) {
            showModal('admin-suspend-user', { model });
        }
    }
});
