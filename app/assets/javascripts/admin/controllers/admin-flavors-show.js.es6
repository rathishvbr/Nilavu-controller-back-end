import FilterProperties from 'nilavu/models/filter-properties';
import NilavuURL from 'nilavu/lib/url';
export default Ember.Controller.extend({
    showSpinner: false,
    showSpinner1:false,
      enableEdit: false,
    flavorsData: Ember.computed.alias('model.message.flavors_data'),
    refresh() {
        this.setProperties({
            fname: '',
            fcpu: '',
            fram: '',
            fdisk: '',
            hdd_cost_hour: '',
            hdd_cost_month: '',
            ssd_cost_hour: '',
            ssd_cost_month: ''
        });
    },

    submitDisabled: function() {
        if (this.get('fieldValidation.failed')) {
            return true;
        }
    }.property('fieldValidation.failed'),

    hdd_cost_hour: function() {
        this.set('flavor', this.get('flavorsData').objectAt(0));
        return FilterProperties.byKey(this.get('flavor.price'), "hdd_cost_hour");
    }.property('flavor.price'),

    region: function() {
        if (this.get('flavor.regions') != undefined) {
            return this.get('flavor.regions').objectAt(0);
        }

    }.property('flavor'),

    hdd_cost_month: function() {
        return FilterProperties.byKey(this.get('flavor.price'), "hdd_cost_month");
    }.property('flavor.price'),

    fname: function() {
        return this.get('flavor.name');
    }.property('flavor.name'),

    fcpu: function() {
      return this.get('flavor.cpu');
    }.property('flavor.cpu'),

    fram: function() {
        return this.get('flavor.ram');
    }.property('flavor.ram'),

    fdisk: function() {
        return this.get('flavor.disk');
    }.property('flavor.disk'),




    ssd_cost_hour: function() {
        return FilterProperties.byKey(this.get('flavor.price'), "ssd_cost_hour");
    }.property('flavor.price'),

    ssd_cost_month: function() {
        return FilterProperties.byKey(this.get('flavor.price'), "ssd_cost_month");
    }.property('flavor.price'),

    cpu_cost_hour: function() {
        return FilterProperties.byKey(this.get('flavor.price'), "cpu_cost_hour");
    }.property('flavor.price'),

    cpu_cost_month: function() {
        return FilterProperties.byKey(this.get('flavor.price'), "cpu_cost_month");
    }.property('flavor.price'),

    ram_cost_hour: function() {
        return FilterProperties.byKey(this.get('flavor.price'), "ram_cost_hour");
    }.property('flavor.price'),

    ram_cost_month: function() {
        return FilterProperties.byKey(this.get('flavor.price'), "ram_cost_month");
    }.property('flavor.price'),

    fieldValidation: function() {
        if (Ember.isEmpty(this.get('fname')) || Ember.isEmpty(this.get('fcpu')) || Ember.isEmpty(this.get('fram')) || Ember.isEmpty(this.get('fdisk')) || Ember.isEmpty(this.get('hdd_cost_hour')) || Ember.isEmpty(this.get('hdd_cost_month')) || Ember.isEmpty(this.get('ssd_cost_hour')) || Ember.isEmpty(this.get('ssd_cost_month')) || Ember.isEmpty(this.get('cpu_cost_hour')) || Ember.isEmpty(this.get('cpu_cost_month')) || Ember.isEmpty(this.get('ram_cost_hour')) || Ember.isEmpty(this.get('ram_cost_month'))) {
            return ({failed: true});
        }
    }.property('fname', 'fcpu', 'fram', 'fdisk', 'hdd_cost_hour', 'hdd_cost_month', 'ssd_cost_hour', 'ssd_cost_month', 'cpu_cost_hour', 'cpu_cost_month', 'ram_cost_hour', 'ram_cost_month'),

    getData() {
        var price = [
            {
                key: 'hdd_cost_hour',
                value: this.get('hdd_cost_hour')
            }, {
                key: 'hdd_cost_month',
                value: this.get('hdd_cost_month')
            }, {
                key: 'ssd_cost_hour',
                value: this.get('ssd_cost_hour')
            }, {
                key: 'ssd_cost_month',
                value: this.get('ssd_cost_month')
            }, {
                key: 'cpu_cost_hour',
                value: this.get('cpu_cost_hour')
            }, {
                key: 'cpu_cost_month',
                value: this.get('cpu_cost_month')
            }, {
                key: 'ram_cost_hour',
                value: this.get('ram_cost_hour')
            }, {
                key: 'ram_cost_month',
                value: this.get('ram_cost_month')
            }
        ];
        
        return {
            name: this.get('fname'),
            cpu: this.get('fcpu'),
            ram: this.get('fram'),
            disk: this.get('fdisk'),
            regions: this.get('region').w(),
            price: JSON.stringify(price),
            properties: [],
            status: this.constants.INPROGRESS
        };
    },

    actions: {
        updateFlavors: function() {
            var self = this;
              this.set("showSpinner", true);
                Nilavu.ajax("/admin/flavors/"+self.get('model.message.flavors_data.firstObject.id'), {
                data: self.getData(),
                type: 'PUT'
            }).then(function(result) {
                self.set('showSpinner', false);
                if (result.success) {
                    self.notificationMessages.success(I18n.t("admin.flavors.flavor_update_success"));
                    self.refresh();
                    NilavuURL.redirectTo('/admin/flavors');
                } else {
                    self.notificationMessages.error(I18n.t("admin.flavors.flavor_update_failure"));
                }
            }).catch(function() {
                self.set('showSpinner', false);
                self.notificationMessages.error(I18n.t("admin.flavors.flavor_update_failure"));
            });

        },


    delete() {
        var self = this;
        self.set('showSpinner1', true);
        const  message = I18n.t("admin.dashboard.launches.delete_confirm");
                  const performDelete = function() {
                      return Nilavu.ajax('/admin/flavors/' + self.get('model.message.flavors_data.firstObject.id')+ "/remove", {
                data: {
                id:self.get('model.message.flavors_data.firstObject.id'),
              name:self.get('model.message.flavors_data.firstObject.name'),
            },
                type: 'DELETE'
            }).then(function(results) {
              self.set('showSpinner1', false);
                              if (results.success) {
                    self.notificationMessages.success(I18n.t("admin.flavors.flavor_delete_success"));
                  NilavuURL.redirectTo('/admin/flavors');
                  } else {
                        self.notificationMessages.error(I18n.t("admin.flavors.flavor_delete_failure"));
                      }
              }).catch(function() {
                self.set('showSpinner1', false);
                self.notificationMessages.error(I18n.t("admin.flavors.flavor_delete_failure"));
              });
};
        const buttons = [
            {
                "label": I18n.t("admin.flavors.cancel"),
                "class": "cancel",
                "link": true
            }, {
                "label": '<i class="fa fa-exclamation-triangle"></i>' + I18n.t('admin.dashboard.launches.delete_accept'),
                "class": "btn btn-danger",
                "callback": function() {
                    performDelete();
                }
            }
        ];
        bootbox.dialog(message, buttons, {"classes": "delete--modal"});

    }

}

});
