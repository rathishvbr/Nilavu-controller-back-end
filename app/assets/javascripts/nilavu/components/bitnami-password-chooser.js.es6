export default Ember.Component.extend({

    failed: true,

    admin_email: Nilavu.SiteSettings.bitnami_admin_email,

    providerChange: function() {
        this.set('provider', this.get('category.versiondetail.provider'));
    }.observes('category.versiondetail'),

    passwordChanged: function() {
        this.set('category.bitnami_username', this.get('admin_email'));
        this.set('category.bitnamiPassword', this.get('bitPassword'));
    }.observes('bitPassword'),

    showPassword: function() {
        if (this.get('provider') === 'bitnami') {
            this.set('category.bitnamiPassword', false);
            this.set('category.bitnami_username', false);
            return true;
        } else {
            this.set('category.bitnamiPassword', true);
            this.set('category.bitnami_username', true);
            this.set('category.validation', true);
            return false;
        }
    }.property('provider'),

    passwordValidation: function() {
        const passwordLength = Nilavu.SiteSettings.min_password_length;
        if (this.get('bitPassword').length < passwordLength) {
            this.set('failed', true);
            return this.set('category.validation', false);
        }
        this.set('failed', false);
        return this.set('category.validation', true);
    }.observes('bitPassword'),

    passwordInstructions: function() {
        return I18n.t('user.password.instructions', {count: Nilavu.SiteSettings.min_password_length});
    }.property(),

    passwordCorrect: function() {
        return I18n.t('user.password.ok');
    }.property(),

    enterPassword: function() {
        return I18n.t('user.password.enter');
    }.property()
});
