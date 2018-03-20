export default Nilavu.Route.extend({
  titleToken() {
    return I18n.t('admin.title');
  },

  activate() {
    this.controllerFor("application").setProperties({
      showTop: true,
      showFooter: true,
    });
  },

  deactivate() {
    this.controllerFor("application").set("showTop", true);
  }
});
