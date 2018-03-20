import { setting } from 'nilavu/lib/computed';

// This is happening outside of the app via popup
const AuthErrors = ['requires_invite', 'awaiting_approval', 'awaiting_confirmation', 'admin_not_allowed_from_ip_address',
    'not_allowed_from_ip_address'
];


export default Ember.Controller.extend({
    needs: ['modal', 'createAccount', 'forgotPassword', 'application'],
    showTop: true,
    showFooter: false,
    authenticate: null,
    loggingIn: false,
    loggedIn: false,

    canLoginLocal: setting('enable_local_logins'),
    loginRequired: Em.computed.alias('controllers.application.loginRequired'),

    resetForm: function() {
        this.set('authenticate', null);
        this.set('loggingIn', false);
        this.set('loggedIn', false);
    },

    /**
     Determines whether at least one login button is enabled
    **/
    hasAtLeastOneLoginButton: function() {
        return Em.get("Nilavu.LoginMethod.all").length > 0;
    }.property("Nilavu.LoginMethod.all.@each"),

    loginButtonText: function() {
        return this.get('loggingIn') ? I18n.t('login.logging_in') : I18n.t('login.title');
    }.property('loggingIn'),

    loginDisabled: Em.computed.or('loggingIn', 'loggedIn'),

    showSignupLink: function() {
        return this.get('controllers.application.canSignUp') &&
            !this.get('loggingIn') &&
            Ember.isEmpty(this.get('authenticate'));
    }.property('loggingIn', 'authenticate'),

    showSpinner: function() {
        return this.get('loggingIn') || this.get('authenticate');
    }.property('loggingIn', 'authenticate'),

    takeTourUrl: function() {
        return Nilavu.SiteSettings.take_tour_url;
    }.property(),

    takeTourEnable: function() {
        return Nilavu.SiteSettings.enable_take_a_tour;
    }.property(),

    contactUrl: function() {
        return Nilavu.SiteSettings.contact_url;
    }.property(),

    orgName: function() {
        return Nilavu.SiteSettings.title;
    }.property(),

    orgDescription: function() {
        return Nilavu.SiteSettings.org_description;
    }.property(),

    actions: {
        login: function() {
            const self = this;

            if (Ember.isEmpty(this.get('loginName')) || Ember.isEmpty(this.get('loginPassword'))) {
                this.notificationMessages.error(I18n.t('login.blank_email_or_password'));
                return;
            }

            this.set('loggingIn', true);

            Nilavu.ajax("/sessions", {
                data: { email: this.get('loginName'), password: this.get('loginPassword') },
                type: 'POST'
            }).then(function(result) {
                // Successful login
                if (result.error) {
                    self.set('loggingIn', false);
                    if (result.reason === 'not_activated') {
                        self.send('showNotActivated', {
                            username: self.get('loginName'),
                            sentTo: result.sent_to_email,
                            currentEmail: result.current_email
                        });
                    } else {
                        self.notificationMessages.error(result.error);
                    }
                    return;
                } else {
                    self.set('loggedIn', true);
                    // Trigger the browser's password manager using the hidden static login form:
                    const $hidden_login_form = $('#hidden-login-form');
                    const destinationUrl = $.cookie('destination_url');
                    const shouldRedirectToUrl = self.session.get("shouldRedirectToUrl");
                    // const ssoDestinationUrl = $.cookie('sso_destination_url');
                    $hidden_login_form.find('input[name=username]').val(self.get('loginName'));
                    $hidden_login_form.find('input[name=password]').val(self.get('loginPassword'));

                    if (destinationUrl) {
                        // redirect client to the original URL
                        $.cookie('destination_url', null);
                        $hidden_login_form.find('input[name=redirect]').val(destinationUrl);
                    } else if (shouldRedirectToUrl) {
                        self.session.set("shouldRedirectToUrl", null);
                        $hidden_login_form.find('input[name=redirect]').val(shouldRedirectToUrl);
                    } else {
                        $hidden_login_form.find('input[name=redirect]').val(window.location.href);
                    }

                    if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) && navigator.userAgent.match(/Safari/g)) {
                        // In case of Safari on iOS do not submit hidden login form
                        window.location.href = $hidden_login_form.find('input[name=redirect]').val();
                    } else {
                        $hidden_login_form.submit();
                    }

                    return;
                }

            }, function(e) {
                if (e.jqXHR && e.jqXHR.status === 429) {
                    this.notificationMessages.error(I18n.t('login.rate_limit'));
                } else {
                    this.notificationMessages.error(I18n.t('login.error'));
                }
                self.set('loggingIn', false);
            });

            return false;
        },

        externalLogin: function(loginMethod) {
            const name = loginMethod.get("name");
            const customLogin = loginMethod.get("customLogin");

            if (customLogin) {
                customLogin();
            } else {
                var authUrl = Nilavu.getURL("/auth/" + name);
                if (loginMethod.get("fullScreenLogin")) {
                    window.location = authUrl;
                } else {
                    this.set('authenticate', name);
                    const left = this.get('lastX') - 400;
                    const top = this.get('lastY') - 200;

                    const height = loginMethod.get("frameHeight") || 400;
                    const width = loginMethod.get("frameWidth") || 800;
                    const w = window.open(authUrl, "_blank",
                        "menubar=no,status=no,height=" + height + ",width=" + width + ",left=" + left + ",top=" + top);
                    const self = this;
                    const timer = setInterval(function() {
                        if (!w || w.closed) {
                            clearInterval(timer);
                            self.set('authenticate', null);
                        }
                    }, 1000);
                }
            }
        },

        createAccount: function() {
            const createAccountController = this.get('controllers.createAccount');
            if (createAccountController) {
                createAccountController.resetForm();
                const loginName = this.get('loginName');
                if (loginName && loginName.indexOf('@') > 0) {
                    createAccountController.set("accountEmail", loginName);
                } else {
                    createAccountController.set("accountUsername", loginName);
                }
            }
            this.send('showCreateAccount');
        },

        forgotPassword: function() {
            const forgotPasswordController = this.get('controllers.forgotPassword');
            if (forgotPasswordController) { forgotPasswordController.set("accountEmailOrUsername", this.get("loginName")); }
            this.send("showForgotPassword");
        },

    },

    authMessage: (function() {
        if (Ember.isEmpty(this.get('authenticate'))) return "";
        const method = Nilavu.get('LoginMethod.all').findProperty("name", this.get("authenticate"));
        if (method) {
            return method.get('message');
        }
    }).property('authenticate'),

    authenticationComplete(options) {

        const self = this;

        function loginError(errorMsg) {
            Ember.run.next(function() {
                this.notificationMessages.error(errorMsg);
                self.set('authenticate', null);
            });
        }

        for (let i = 0; i < AuthErrors.length; i++) {
            const cond = AuthErrors[i];
            if (options[cond]) {
                return loginError(I18n.t("login." + cond));
            }
        }

        // Reload the page if we're authenticated
        if (options.authenticated) {
            const destinationUrl = $.cookie('destination_url');
            const shouldRedirectToUrl = self.session.get("shouldRedirectToUrl");
            Nilavu.Session.currentProp(`external_auth_${options.authenticator_name}result`, options); // this is set if OAuth Succeeds

            if (self.get('loginRequired') && destinationUrl) {
                // redirect client to the original URL
                $.cookie('destination_url', null);
                window.location.href = destinationUrl;
            } else if (shouldRedirectToUrl) {
                self.session.set("shouldRedirectToUrl", null);
                window.location.href = shouldRedirectToUrl;
            } else if (window.location.pathname === Nilavu.getURL('/login')) {
                window.location.pathname = Nilavu.getURL('/');
            }
            /*else {  I don't think we need this.
              window.location.reload();
            }*/
            return;
        }

        const createAccountController = this.get('controllers.createAccount');
        createAccountController.setProperties({
            accountEmail: options.email,
            accountUsername: options.username,
            accountName: options.name,
            authOptions: Ember.Object.create(options)
        });
    }

});
