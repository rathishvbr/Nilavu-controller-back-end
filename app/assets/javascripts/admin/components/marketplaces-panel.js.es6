const MarketplacesPanel = Ember.Component.extend({
  classNameBindings: [':modal-tab', 'activeTab::invisible'],
});

export default MarketplacesPanel;

export function buildMarketplacesPanel(tab, extras) {
  return MarketplacesPanel.extend({
    activeTab: Ember.computed.equal('selectedTab', tab)
  }, extras || {});
}
