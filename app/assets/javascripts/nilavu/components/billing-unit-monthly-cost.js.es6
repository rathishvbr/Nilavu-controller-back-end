export default Ember.Component.extend({
    currency: function() {
        const regionCurrency = this.get('unitFlav.currency');
        if (regionCurrency) {
            return new Handlebars.SafeString(regionCurrency);
        }
    }.property('unitFlav','flavor'),

    hourlyCpuCost: function() {
      return this.get('unitFlav.vm_cpu_cost_per_hour');
    }.property('unitFlav','flavor'),

    hourlyMemoryCost: function() {
    return this.get('unitFlav.vm_memory_cost_per_hour');
    }.property('unitFlav','flavor'),

    hourlyStorageCost: function() {
      const uf = this.get('unitFlav');
      if (!Ember.isEmpty(uf)) {
          return uf.storagePrice("SDD");
      }
    }.property('unitFlav','flavor'),

    hourlybandwidthCost: function() {
    return this.get('unitFlav.vm_bandwidth_cost_per_hour');
    }.property('unitFlav','flavor'),

    _rerenderOnChange: function() {
        this.rerender();
    }.observes('unitFlav')
});
