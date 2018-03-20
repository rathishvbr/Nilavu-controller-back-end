export default Ember.Controller.extend({
    indexStream: false,
    needs: [
        'application', 'user-notifications'
    ],

    currentPath: Em.computed.alias('controllers.application.currentPath'),
    title: "My Profile",
    selectedTab: null,
    panels: null,
    rerenderTriggers: ['isUploading'],

    _initPanels: function() {
        this.set('panels', []);
        this.set('selectedTab', 'account');
    }.on('init'),

    accoutSelected: function() {
        return this.selectedTab === 'account';
    }.property('selectedTab'),

    organizationSelected: function() {
        return this.selectedTab === 'organization';
    }.property('selectedTab'),

    apikeySelected: function() {
        return this.selectedTab === 'apikey';
    }.property('selectedTab'),

    organizationType: function() {
        const grouped_results = this.get('model.details');

        let otmap = [];

        for (var order in grouped_results) {
            if (grouped_results.hasOwnProperty(order)) {
                otmap.push({order: order, name: grouped_results[order].get('firstObject.name')});
            }
        }
        return otmap;
    }.property('model.details')
});
