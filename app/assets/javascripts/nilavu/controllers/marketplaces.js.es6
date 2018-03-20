import BufferedContent from 'nilavu/mixins/buffered-content';
import showModal from 'nilavu/lib/show-modal';

import OpenComposer from "nilavu/mixins/open-composer";

export default Ember.Controller.extend(BufferedContent, OpenComposer, {
  needs: ['application'],
  loading: false,

  title: function() {
    return I18n.t("marketplaces.title");
  }.property(),

  _initPanels: function() {}.on('init'),

  addItem: function() {
    return this.get("currentUser.authority") === "admin";
  }.property(),

  orderedCatTypes: function() {
    const grouped_results = this.get('model.results');
    let otmap = [];
    for (let order in grouped_results) {
      if (grouped_results.hasOwnProperty(order)) {
        otmap.push({
          order: order,
          cattype: grouped_results[order].get('firstObject.cattype').toLowerCase().capitalize().replace('Torpedo', 'Machines')
        });
      }
    }
    return otmap;
  }.property('model.results'),

  //check the freewheeling site setting flag for true or false
  minifiedVersion: function() {
    return false;
  }.property('selectedTab'),


  actions: {

    showMarketplaceItem() {},

    save() {},

    createTopic(item) {
      const self = this;
      var itemOption = "applications";
      // Don't show  if we're still loading, may be show a growl.
      if (self.get('loading')) {
        return;
      }
      if (Ember.isEqual(item.cattype, 'TORPEDO'))
        itemOption = "virtualmachines";
      self.set('loading', true);
      self.openComposer().then(function(result) {
        self.set('loading', false);
        showModal('editCategory', {
          model: result,
          smallTitle: false,
          titleCentered: true,
          close: true
        }).setProperties({
          marketplaceItem: item,
          selectedItemOption: itemOption
        });
      }).catch(function() {
        self.set('loading', false);
      });
    }
  },

  hasError: Ember.computed.or('model.notFoundHtml', 'model.message'),

  noErrorYet: Ember.computed.not('hasError')

});
