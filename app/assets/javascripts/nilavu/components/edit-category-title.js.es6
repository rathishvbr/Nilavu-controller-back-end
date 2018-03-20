export default Ember.Component.extend({
    _initPanels: function() {
        this.set('launchable', 'virtualmachines');
    }.on('init')
});
