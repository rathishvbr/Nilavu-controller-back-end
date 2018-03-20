import ViewingActionType from "nilavu/mixins/viewing-action-type";

export default Nilavu.Route.extend(ViewingActionType, {
  redirect() {
      return this.redirectIfLoginRequired();
  },

  renderTemplate() {},

  actions: {
    didTransition() {
      this.controllerFor("user-notifications")._showFooter();
      return true;
    }
  },

  model() {
    const email = this.modelFor("user").get("email");

    if (this.get("currentUser.email") ===  email || this.get("currentUser.admin")) {
      return this.store.find("notification", { email, limit: 40, category: "All" } );
    }
  },


  setupController(controller, model) {
    controller.set("model", model);
    controller.set("user", this.modelFor("user"));
    this.viewingActionType(-1);
  }
});
