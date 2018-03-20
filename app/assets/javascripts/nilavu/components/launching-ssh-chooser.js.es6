import debounce from 'nilavu/lib/debounce';
import SSHOptionType from 'nilavu/models/sshoption-type';

export default Ember.Component.extend({
  failed: true,
    selectedSSHOption: function() {
        return SSHOptionType.ROOT_PASSWORD;
    }.property(),

    sshOptionChanged: function() {
        this.set('category.keypairoption', this.get('selectedSSHOption'));
        if (this.get('showOldPairs')) {
            this.set('category.keypairnameoption', this.get('selectedKeyPairOption'));
            this.set('category.rootpasswordValidation', true);
        } else if (this.get('showNewPairs')) {
            this.set('category.keypairnameoption', this.get('securingName'));
            this.set('category.rootpasswordValidation', true);
        } else {
            this.set('category.keypairnameoption', this.get('rootPassword'));
        }
    },

    showOldPairs: function() {
        if (this.get('selectedSSHOption') == SSHOptionType.OLD)
            return true;

        return false;
    }.property('category.summarizing.sshs', 'category.keypairoption'),

    showNewPairs: function() {
        if (this.get('selectedSSHOption') == SSHOptionType.CREATE)
            return true;

        return false;
    }.property('showOldPairs', 'selectedSSHOption'),

    oldPairs: function() {
        return this.get('category.summarizing.sshs');
    }.property('category.summarizing.sshs'),

    oldPairFrequencies: function() {
        var rval = [];
        _.each(this.get("oldPairs"), function(p) {
            rval.addObject({name: p, value: p});
        });
        return rval;
    }.property("oldPairs"),

    selectedKeyPairOption: function() {
        return this.get('oldPairFrequencies.firstObject');
    }.property('oldPairFrequencies'),

    passwordValidation: function() {
        const passwordLength = Nilavu.SiteSettings.min_password_length;
        if (this.get('rootPassword').length < passwordLength) {
            this.set('failed', true);
            return this.set('category.rootpasswordValidation', false);
        }
        this.set('failed', false);
        return this.set('category.rootpasswordValidation', true);
    }.observes('rootPassword'),

    passwordInstructions: function() {
        return I18n.t('user.password.instructions', {count: Nilavu.SiteSettings.min_password_length});
    }.property(),

    passwordCorrect: function() {
        return I18n.t('user.password.ok');
    }.property(),

    //TO-DO: attach inputvalidation to make sure it doesn't exists
    //(like checking existing createAccount) and the minimum number
    //of characters is 4 (loaded from site_settings.yaml)
    securingNameChanged: debounce(function() {
        this.sshOptionChanged();
    }, 250).observes('securingName', 'rootPassword'),

    change: function() {
        Ember.run.once(this, 'sshOptionChanged');
    }

});
