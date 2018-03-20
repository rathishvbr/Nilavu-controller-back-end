import PreloadStore from 'preload-store';

export default {
  name: "banner",

  initialize(container) {

    const banner = Em.Object.create(PreloadStore.get("banner")),
          site = container.lookup('site:main');

    site.set("banner", banner);

  }
};
