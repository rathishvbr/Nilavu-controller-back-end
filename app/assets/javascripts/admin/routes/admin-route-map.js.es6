export default {
  resource: 'admin',

  map() {

    this.route('dashboard', {
      path: '/'
    });

    this.resource('adminVmList', {
      path: '/vmlist/all'
    });

    this.resource('adminSiteSettings', {
      path: '/site_settings'
    }, function() {
      this.resource('adminSiteSettingsCategory', {
        path: 'category/:category_id'
      });
    });

    this.resource('adminReports', {
      path: '/reports/:type'
    });


    this.resource('adminBackup', {
      path: '/settings/backup'
    }, function() {
      this.route('show', {
        path: '/:backup_id'
      });
    });


    this.resource('adminFlavors', {
      path: '/flavors'
    }, function() {
      this.route('add', {
        path: '/add'
      });
      this.route('show', {
        path: '/:id'
      });

    });

    this.resource('adminAddUser', {
      path: '/newuser'
    });

    this.resource('adminRawimages', {
      path: '/settings/rawimages'
    });
    this.resource('adminBackups', {
      path: '/settings/backups'
    });


    this.resource('adminLicense', {
      path: '/list'
    }, function() {
      this.route('show', {
        path: '/:filter'
      });
    });

    this.resource('adminUser', {
      path: '/users/:email/:api_key'
    }, function() {
      this.route('adminUserIndex');
    });

    this.resource('adminUsers', {
      path: '/users'
    }, function() {
      this.resource('adminUsersList', {
        path: '/list'
      }, function() {
        this.route('show', {
          path: '/:filter'
        });
      });
    });

    this.resource('adminLicenses', {
      path: '/license'
    }, function() {
      this.resource('adminLicense', {
        path: '/:license'
      }, function() {});

      this.resource('adminLicensesList', {
        path: '/list'
      }, function() {
        this.route('show', {
          path: '/:filter'
        });
      });

    });
  }
};
