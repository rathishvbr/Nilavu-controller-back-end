import NilavuURL from 'nilavu/lib/url';
import debounce from 'nilavu/lib/debounce';
import {setting} from 'nilavu/lib/computed';
export default Ember.Controller.extend({
  authorityContent: ["admin","regular","clusteradmin"],

active:false,
approved: false,
rejectedEmails: Em.A([]),
uniqueEmailValidation: null,
isDeveloper: false,
isPhone: false,
format: /^[0-9]+$/,
active:false,
approved:false,
      submitDisabled: function() {
        if (this.get('emailValidation.failed'))
            return true;
        if (this.get('passwordValidation.failed'))
            return true;
        if (this.get('passwordConfirmValidation.failed'))
            return true;
            if (this.get('nameValidation.failed'))
                return true;

        if (this.get('phonenumberValidation.failed'))
            return true;

          return false;
      }.property('nameValidation','passwordRequired', 'emailValidation.failed', 'passwordValidation.failed', 'passwordConfirmValidation.failed', 'phonenumberValidation.failed'),

      nameValidation: function() {
          if (Ember.isEmpty(this.get('fname')) || Ember.isEmpty(this.get('lname'))) {
              return Nilavu.InputValidation.create({failed: true});
          }

          return Nilavu.InputValidation.create({ok: true});
      }.property('fname', 'lname'),

      hideAuthority: function(){
        if((this.get('selectedAuthority')) === "regular"){
        return true;
        }else{
          return false;
        }

      }.property('selectedAuthority'),

      passwordRequired: function() {
          return Ember.isEmpty(this.get('authOptions.auth_provider'));
      }.property('authOptions.auth_provider'),

      passwordInstructions: function() {
          return I18n.t('user.password.instructions', {count: Nilavu.SiteSettings.min_password_length});
      }.property('isDeveloper'),

      passwordValidation: function() {
          if (!this.get('passwordRequired')) {
              return Nilavu.InputValidation.create({ok: true});
          }

          // If blank, fail without a reason
          const password = this.get("accountPassword");
          if (Ember.isEmpty(this.get('accountPassword'))) {
              return Nilavu.InputValidation.create({failed: true});
          }

          // If too short
          const passwordLength = Nilavu.SiteSettings.min_password_length;
                    if (password.length < passwordLength) {
                        return Nilavu.InputValidation.create({failed: true, reason: I18n.t('user.password.too_short')});
          }
          if (!Ember.isEmpty(this.get('email')) && this.get('accountPassword') === this.get('email')) {
              return Nilavu.InputValidation.create({failed: true, reason: I18n.t('user.password.same_as_email')});
          }

          // Looks good!
          return Nilavu.InputValidation.create({ok: true, reason: I18n.t('user.password.ok')});
      }.property('accountPassword', 'rejectedPasswords.@each', 'email', 'isDeveloper'),

      passwordConfirmValidation: function() {
          // If blank, fail without a reason
          if (Ember.isEmpty(this.get('re_entery_pass'))) {
              return Nilavu.InputValidation.create({failed: true});
          }

          if (!Ember.isEmpty(this.get('re_entery_pass')) && this.get('accountPassword') === this.get('re_entery_pass')) {
              return Nilavu.InputValidation.create({ok: true, reason: I18n.t('user.password.ok_confirm')});
          }

          if (!Ember.isEmpty(this.get('re_entery_pass')) && this.get('accountPassword') !== this.get('re_entery_pass')) {
              return Nilavu.InputValidation.create({failed: true, reason: I18n.t('user.password.notmatch')});
          }

      }.property('re_entery_pass', 'accountPassword'),

      emailValidation: function() {
          const basicValidation = this.get('basicEmailValidation');
          const uniqueEmail = this.get('uniqueEmailValidation');
          return uniqueEmail
              ? uniqueEmail
              : basicValidation;
      }.property('uniqueEmailValidation', 'basicEmailValidation'),

      basicEmailValidation: function() {
          this.set('uniqueEmailValidation', null);

          // If blank, fail without a reason
          let email;
          if (Ember.isEmpty(this.get('email'))) {
              return Nilavu.InputValidation.create({failed: true});
          }

          email = this.get("email");

          if (this.get('rejectedEmails').contains(email)) {
              return Nilavu.InputValidation.create({failed: true, reason: I18n.t('user.email.invalid')});
          }

          if (!Nilavu.Utilities.emailValid(email)) {
              return Nilavu.InputValidation.create({failed: true, reason: I18n.t('user.email.invalid')});
          }

          this.checkEmailAvailability();
          // Let's check it out asynchronously
          return Nilavu.InputValidation.create({failed: false, reason: I18n.t('user.email.checking')});

      }.property('email', 'rejectedEmails.@each'),

      shouldCheckEmailAvailability: function() {
          return !Ember.isEmpty(this.get('email'));
      },

      checkEmailAvailability: debounce(function() {
          const _this = this;

          if (this.shouldCheckEmailAvailability) {
              Nilavu.User.checkUsername(null, this.get('email')).then(function(result) {
                  _this.set('isDeveloper', false);
                  if (result.errors) {
                      self.set('errorMessage', result.errors.join(' '));
                  } else if (result.available) {
                      return _this.set('uniqueEmailValidation', Nilavu.InputValidation.create({ok: true, reason: I18n.t('user.email.ok')}));
                  } else {
                      return _this.set('uniqueEmailValidation', Nilavu.InputValidation.create({failed: true, reason: I18n.t('user.change_email.taken')}));
                  }
              });
          }
      }, 500),
      phonenumberValidation: function() {
          if (Ember.isEmpty(this.get('mobile'))) {
              return Nilavu.InputValidation.create({failed: true});
          }
          if (!this.get('mobile').match(this.get('format'))) {
              return Nilavu.InputValidation.create({failed: true, reason: I18n.t('user.phone.ischaracter')});
          }
        }.property('mobile', 'format', 'isPhone'),



  getData() {

            return {
              first_name: this.get('fname'),
              last_name: this.get('lname'),
              phone: this.get('mobile'),
              email: this.get('email'),
              password: this.get('accountPassword'),
              password_confirmation: this.get('re_entery_pass'),
              authority: this.get('selectedAuthority'),
              staged: "false" ,
             active: this.get('active'),
              approved: this.get('approved')

            };
  },

actions:{
    create: function() {
              var self=this;
     return Nilavu.ajax("/users", {
          data: self.getData(),
          type: 'POST'
      }).then(function(result) {
          if (result.success) {
            self.notificationMessages.success(I18n.t("admin.newuser.user_creation_success"));
             NilavuURL.redirectTo('/admin/users/list/active');
            } else {
              self.notificationMessages.error(I18n.t("admin.newuser.user_creation_failure"));
          }
      }).catch(function() {
                  self.notificationMessages.error(I18n.t("admin.newuser.user_creation_failure"));
      });

  },

}
});
