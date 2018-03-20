export default Nilavu.Route.extend({
    redirect() {
        return this.redirectIfLoginRequired();
    },

    renderTemplate() {

        this.render('user/show', {
            controller: 'user',
            outlet: 'list-container'
        });
    },
    actions: {
        didTransition() {
            this.controllerFor("application").set("showFooter", true);
            return true;
        }
    }

});
