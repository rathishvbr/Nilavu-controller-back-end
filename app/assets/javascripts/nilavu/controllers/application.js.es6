import computed from 'ember-addons/ember-computed-decorators';

export default Ember.Controller.extend({

    showTop: function() {
        return !this.get('loginRequired');
    }.property(),

    showFooter: function() {
        return !this.loginRequired;
    }.property(),

    styleCategory: null,

    @computed canSignUp() {
        return !Nilavu.SiteSettings.invite_only && Nilavu.SiteSettings.allow_new_registrations && !Nilavu.SiteSettings.enable_sso;
    },

    // I don't like this, but the read-only technique didn't work since the header loads first.
    userActivated: function() {
        if (Nilavu.SiteSettings.allow_billings) {
            return Nilavu.User.current().knockedOff();
        }
        return true;

    }.property(),

    @computed canShowHeader() {
        return (this.site.get("isReadOnly") || this.get('userActivated'));
    },

    @computed loginRequired() {
        return !Nilavu.User.current();
    }
});
