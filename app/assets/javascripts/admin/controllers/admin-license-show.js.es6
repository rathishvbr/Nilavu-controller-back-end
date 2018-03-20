export default Ember.Controller.extend({

    license: Ember.computed.alias('model.license'),

    name: function() {
        return this.get('license.name');
    }.property('license'),

    email: function() {
        return this.get('license.email');
    }.property('license'),

    company: function() {
        return this.get('license.company');
    }.property('license'),

    uploaded: function() {
        return this.get('license.uploaded');
    }.property('license'),

    started: function() {
        return this.get('license.started');
    }.property('license'),

    expires: function() {
        return this.get('license.expires');
    }.property('license'),
    actions: {
        submit: function() {
            this.transitionTo('adminLicensesList.show', 'active');
        }
    }
});
