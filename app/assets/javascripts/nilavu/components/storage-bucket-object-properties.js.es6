import { observes} from 'ember-addons/ember-computed-decorators';
import {formatFileSize} from 'nilavu/helpers/file-formats';
import {storageACL} from 'nilavu/helpers/storage-acl';
export default Ember.Component.extend({

  view: false,
  spinnerACLIn: false,

  showACLSpinner: function() {
      return this.get('spinnerACLIn');
  }.property('spinnerACLIn'),

  textName: function() {
    return I18n.t('bucket.name');
  }.property(),

  textBucket: function() {
    return I18n.t('bucket.title');
  }.property(),

  textLink: function() {
    return I18n.t('bucket.link');
  }.property(),

  textSize: function() {
    return I18n.t('bucket.size');
  }.property(),

  textPermissions: function() {
    return I18n.t('bucket.permissions');
  }.property(),

  textProperties: function() {
    return I18n.t('bucket.properties');
  }.property(),

  textLastModified: function() {
    return I18n.t('bucket.last_modified');
  }.property(),

  textMakePublic: function() {
    return I18n.t('bucket.make_public');
  }.property(),

  textMakePrivate: function() {
    return I18n.t('bucket.make_private');
  }.property(),

  textOwner: function() {
    return I18n.t('bucket.owner');
  }.property(),

  textInfo: function() {
    return I18n.t('bucket.info');
  }.property(),

  textPropertiesInfoMessage: function() {
    return I18n.t('bucket.properties_info_message');
  }.property(),

  objectName: function() {
    return this.get('name');
  }.property('name'),

  objectSize: function() {
    return this.get('size');
  }.property('size'),

  objectLink: function() {
    return this.get('link');
  }.property('link'),

  lastModified: function() {
    return this.get('last_modified');
  }.property('last_modified'),

  aclIcon: function() {
      return this.get('acl');
  }.property('acl'),

  checkACL: function() {
      return this.get('aclValue');
  }.property('aclValue'),

  willDestroyElement() {
    this.set('view', false);
    this.set('selectedItem', null);
  },

  viewProperty: function() {
    return this.get('view');
  }.property('view'),

  @observes('selectedItem')
  selectedObject() {
    if(this.get('selectedItem') != null) {
      this.set('view', true);
      this.updateUI();
    }
  },

  updateUI: function() {
    var self = this;
    _.each(self.get("bucketfiles").message.usage, function(p) {
        if(p.key === self.get('selectedItem')) {
          self.set('name', p.key);
          self.set('size', formatFileSize(p.size));
          self.set('link', p.public_url);
          self.set('last_modified', p.last_modified);

          if(storageACL(p.acl)) {
            self.set('aclValue', true);
            self.set('acl', 'storage-lock');
          } else {
            self.set('aclValue', false);
            self.set('acl', 'storage-unlock');
          }
        }
    });
  },

  actions: {
      setACL(acl) {
        var self = this;
        this.set('spinnerACLIn', true);

        Nilavu.ajax('/b/'+this.get('bucketName').trim(), {
            data: {
                key: self.get('name'),
                acl: acl,
                bucket_name: self.get('bucketName')
            },
            type: 'PUT'
        }).then(function(result) {
            self.set('spinnerACLIn', false);
            if (result.success) {
                self.notificationMessages.success(I18n.t("bucket.object_acl_success"));
                self.get('bucketfiles').reload(self.get('bucketName')).then(function() {
                  self.updateUI();
                }).catch(function() {
                    self.notificationMessages.error(I18n.t('bucket.storage_refresh_error'));
                });
            } else {
                self.notificationMessages.error(I18n.t("bucket.object_acl_error"));
            }
        }).catch(function() {
            self.set('spinnerACLIn', false);
            self.notificationMessages.error(I18n.t("bucket.object_acl_error"));
        });
      }
  }


});
