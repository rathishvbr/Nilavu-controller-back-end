export default function() {

    // Error page
    this.route('exception', {path: '/exception'});

    this.resource('about', {path: '/about'});

    this.resource('discovery', {
        path: '/'
    }, function() {
        // homepage
        this.route(Nilavu.Utilities.defaultHomepage(), {path: '/'});
        // filters
        Nilavu.Site.currentProp('filters').forEach(filter => {
            this.route(filter, {
                path: '/' + filter
            });
        });
    });

    //sshkey routes
    this.resource('sshkeys', {
        path: '/sshkeys'
    }, function() {
        this.route('show', {path: '/'});
    });
    //backups routes
 this.resource('backups',{
   path:'/backups'
 }, function() {
  this.route('list', {path:'/'});
   this.route('show', { path: '/:backup_id'});
 });
    // Topic routes
    this.resource('topic', {
        path: '/t/:asms_id/:id'
    }, function() {
        this.route('show', {path: '/'});
        this.route('predeploy', {path: '/predeploy'});
        this.route('app', {path: '/app'});
        this.route('container', {path: '/container'});

        //path is  /t/:id/start
        this.resource('topicActions', function() {
            this.route('start');
            this.route('stop');
            this.route('destroy');
            this.route('reboot');
        });
    });

    this.resource('billings', {
        path: '/billings'
    }, function() {
        this.route('show', {path: '/'});
    });

    this.resource('marketplaces', {
        path: '/marketplaces'
    }, function() {
        this.route('show', {path: '/'});
        this.resource('marketplace', {
            path: '/activity'
        }, function() {
            this.route('predeploy', {path: '/predeploy/:id'});
            this.route('edit');
            this.route('activate');
            this.route('deactivate');
        });
    });

    // User routes
    this.resource('user', {
        path: '/user/:email'
    }, function() {
        this.route('show', {path: '/'});
        this.route('approveAccount', {path: '/approve_account'});

        this.resource('userNotifications', {
            path: '/notifications'
        }, function() {
            //we use the built in index route
        });

        this.resource('userSubscriptions', {
            path: '/subscriptions'
        }, function() {
            //we use the built in index route
        });

        this.resource('preferences', function() {
            this.route('username');
            this.route('email');
        });

    });

    this.route('signup', {path: '/signup'});

    this.route('login', {path: '/login'});
    this.route('approve-account', {path: '/approve-account'});
    this.route('new-launch', {path: '/new-launch'});
    this.route('vnc', {path: '/vnc'});
    this.route('shell', {path: '/shell'});
    this.route('logout', {path: '/logout'});

    this.route('login-preferences');
    this.route('forgot-password', {path: '/password-reset'});

    this.resource('storages', {
        path: '/storages'
    }, function() {
        this.route('list', {path: '/'});
        this.route('show', {path: '/b/:id'});
    });

    this.resource('billers', {
        path: '/billers'
    }, function() {
        this.route('activate', {path: '/bill/activation'});
    });

    this.resource('subscriptions', {
        path: '/subscriptions'
    }, function() {
        this.route('show', {path: '/account/activation'});

    });

}
