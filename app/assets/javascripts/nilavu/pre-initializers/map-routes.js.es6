import { mapRoutes } from 'nilavu/mapping-router';

export default {
  name: "map-routes",
  after: 'inject-nilavu-objects',

  initialize(container, app) {
    app.register('router:main', mapRoutes());

    // HACK to fix: https://github.com/emberjs/ember.js/issues/10310
    const originalBuildInstance = originalBuildInstance || Ember.Application.prototype.buildInstance;
    Ember.Application.prototype.buildInstance = function() {
      this.registry = this.buildRegistry();
      return originalBuildInstance.apply(this);
    };
  }
};
