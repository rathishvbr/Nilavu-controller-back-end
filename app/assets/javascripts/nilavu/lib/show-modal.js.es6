export default function(name, opts) {
  opts = opts || {};
  const container = Nilavu.__container__;

  // We use the container here because modals are like singletons
  // in Nilavu. Only one can be shown with a particular state.
  const route = container.lookup('route:application');
  const modalController = route.controllerFor('modal');

  modalController.set('modalClass', null);

  const viewClass = container.lookupFactory('view:' + name);
  const controller = container.lookup('controller:' + name);

  if (viewClass) {
    route.render(name, { into: 'modal', outlet: 'modalBody' });
  } else {
    const templateName = Ember.String.dasherize(name);

    const renderArgs = { into: 'modal', outlet: 'modalBody', view: 'modal-body'};
    if (controller) { renderArgs.controller = name; }

    route.render('modal/' + templateName, renderArgs);

    if (opts.smallTitle) {
        modalController.set('smallTitle', opts.smallTitle);
    }

    if (opts.titleCentered) {
        modalController.set('titleCentered', opts.titleCentered);
    }

    if (opts.close) {
        modalController.set('close', opts.close);
    }

    if (opts.title) {
      modalController.set('title', I18n.t(opts.title));
    }

    if (opts.userTitle) {
      modalController.set('title', opts.userTitle);
    }

  if (opts.modalSize) {
      modalController.set('width_height', opts.modalSize);
     }

  }

  if (controller) {
    if (controller.resetForm) { controller.resetForm(); }

    const model = opts.model;
    if (model) {
        controller.set('model', model);
    }

    if (controller.onShow) { controller.onShow(); }
    controller.set('flashMessage', null);
  }

  return controller;
};
