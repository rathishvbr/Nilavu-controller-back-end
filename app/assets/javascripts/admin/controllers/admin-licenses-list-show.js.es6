export default Ember.Controller.extend({
    selectedption: null,
    editingResource: false,
    formSubmitted: false,

    selectedOptionChanged: function() {
      return this.set('model.licencesOption', this.get('selectedOption'));
    }.observes('selectedOption'),

    licenseValueSubmit: function() {
        this.set('formSubmitted', true);
    }.observes('licenseKey'),

    licenseValue: function() {
       return this.get('licenseKey');
    }.property('licenseKey'),

    submitDisabled: function() {
        if (!this.get('formSubmitted'))
            return true;
        return false;
    }.property('formSubmitted'),


    actions: {
        submit: function() {
            const self = this;
            return Nilavu.ajax("/admin/license/list/active", {
                data: {
                  data: this.get('licenseValue')
                },
                type: 'POST'
            }).then(function(result) {
                if (result.success) {
                    self.notificationMessages.success(result.success);
                      self.transitionTo('adminLicense.show', 'active');
                }
                if (result.error) {
                    self.notificationMessages.error(result.error);
                }
            }).catch(function(e) {
                console.log(e);
            });

        }

    }
});
