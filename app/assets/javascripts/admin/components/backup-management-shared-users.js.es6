import FilterProperties from 'nilavu/models/filter-properties';
export default Ember.Component.extend({

  sharedWith: "private",
  _sharingNow: [],
  _unsharingNow: [],

  sharingSelectionChanged: function() {
    if (this.get("sharingSelected.checked")) {
      this._checked();
    } else {
      this._unchecked();
    }

  }.observes("sharingSelected"),

  _checked: function() {
    var self = this;
    var flag = false;
    if(!Ember.isBlank(self.get('backup.labels'))){
    self.get('backup.labels').forEach(function(label) {
      if (label.value === self.get('sharingSelected.email')) {
        flag = true;
      }
    });
  }
    if (!flag) {
      self.get('_sharingNow').pushObject(self.get('sharingSelected.email'));
    }
    self.get('_unsharingNow').forEach(function(label) {
      if (label === self.get('sharingSelected.email')) {
        self.get('_unsharingNow').removeObject(self.get('sharingSelected.email'));
      }
    });
  },

  _unchecked: function(){
    var self = this;
    if(!Ember.isBlank(self.get('backup.labels'))){
    self.get('backup.labels').forEach(function(label) {
      if (label.value === self.get('sharingSelected.email')) {
        self.get('_unsharingNow').pushObject(label.value);
      }
    });
  }
    self.get('_sharingNow').forEach(function(label) {
      if (label === self.get('sharingSelected.email')) {
        self.get('_sharingNow').removeObject(self.get('sharingSelected.email'));
      }
});

  },


  applySharedPreference: function() {

    return !(this.get('_sharingNow').length > 0 || this.get('_unsharingNow').length > 0);
  }.property('sharingSelected','_sharingNow',"_unsharingNow"),

  getData: function() {
    var inputs = [{
        "key": "public_url",
        "value": FilterProperties.byKey(this.get('backup.inputs'), "public_url")
      },
      {
        "key": "region",
        "value": FilterProperties.byKey(this.get('backup.inputs'), "region")
      },
      {
        "key": "shared_with",
        "value": this.get('sharedWith')
      }

    ];

    return {
      id: this.get('backup.id'),
      name: this.get('backup.name'),
      account_id: this.get('backup.account_id'),
      tosca_type: this.get('backup.tosca_type'),
      asm_id: this.get('backup.asm_id'),
      created_at: this.get('backup.created_at'),
      status: this.get('backup.status'),
      inputs: JSON.stringify(inputs),
      labels: JSON.stringify(this.get('_sharingNow').map(x => ({
        "key": "email",
        "value": x
      }))),

    };
  },

clear: function(){
  this.set('_sharingNow', []);
  this.set('_unsharingNow', []);
},

  actions: {

    apply: function() {
      var self = this;
      this.set("showSpinner", true);
      Nilavu.ajax("/admin/backups/" + this.get('backup').id + "/share", {
        data: self.getData(),
        type: 'PUT'
      }).then(function(result) {
        self.set('showSpinner', false);
        if (result.success) {
          self.notificationMessages.success(I18n.t("admin.backup.backup_update_success"));
          self.get('model').reload({backup_id:self.get('backup.id')});
          self.clear();
        } else {
          self.notificationMessages.error(I18n.t("admin.backup.backup_update_failure"));
        }
      }).catch(function() {
        self.set('showSpinner', false);
        self.notificationMessages.error(I18n.t("admin.backup.backup_update_failure"));
      });
    },

  },

});
