import NilavuURL from 'nilavu/lib/url';

export default Ember.Controller.extend({

    showSpinner: false,
    checkedVm: true,
    checkedContainer: false,
    emptyPlatform: false,
    category: [],
    platformActivator: true,
    categoryEmpty: true,
    platforms: [],

    _init: function() {
        this.get('platforms').pushObject((this.constants.VM).toUpperCase());
        this.get('platforms').pushObject(this.constants.CONTAINER);
    }.on('init'),

    refresh() {
        this.setProperties({
            f_name: '',
            f_cpu: '',
            f_ram: '',
            f_disk: '',
            hdd_cost_hour: '',
            hdd_cost_month: '',
            ssd_cost_hour: '',
            ssd_cost_month: '',
            cpu_cost_hour: '',
            cpu_cost_month: '',
            ram_cost_hour: '',
            ram_cost_month: ''
        });
    },

    submitDisabled: function() {
        if (this.get('fieldValidation.failed')) {
            return true;
        }
    }.property('fieldValidation.failed'),

    regionData: function() {
        let region = [];
        region.pushObject(this.get('subRegionOption'));
        this.set('regions', region);
    }.observes('subRegionOption'),

    platformsChecker: function() {

        if (Ember.isEmpty(this.get('category'))) {
            this.set('categoryEmpty', true);
        } else {
            this.set('categoryEmpty', false);
        }

    }.observes('platformActivator'),

    fieldValidation: function() {

        if (Ember.isEmpty(this.get('f_name')) || Ember.isEmpty(this.get('f_cpu')) || Ember.isEmpty(this.get('f_ram')) || Ember.isEmpty(this.get('f_disk')) || Ember.isEmpty(this.get('hdd_cost_hour')) || this.get('categoryEmpty') || Ember.isEmpty(this.get('hdd_cost_month')) || Ember.isEmpty(this.get('ssd_cost_hour')) || Ember.isEmpty(this.get('ssd_cost_month')) || Ember.isEmpty(this.get('cpu_cost_hour')) || Ember.isEmpty(this.get('cpu_cost_month')) || Ember.isEmpty(this.get('ram_cost_hour')) || Ember.isEmpty(this.get('ram_cost_month'))) {
            return ({failed: true});
        }
    }.property('f_name', 'f_cpu', 'f_ram', 'f_disk', 'hdd_cost_hour', 'hdd_cost_month', 'ssd_cost_hour', 'ssd_cost_month', 'cpu_cost_hour', 'cpu_cost_month', 'ram_cost_hour', 'ram_cost_month', 'categoryEmpty'),

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
            name: this.get('f_name'),
            cpu: this.get('f_cpu'),
            ram: this.get('f_ram'),
            disk: this.get('f_disk'),
            regions: this.get('regions'),
            price: JSON.stringify(price),
            properties: [],
            category: this.get('category'),
            status: this.constants.INPROGRESS
        };
    },

    actions: {
        addFlavors: function() {
            var self = this;
            this.set("showSpinner", true);
            Nilavu.ajax("/admin/flavors/add", {
                data: self.getData(),
                type: 'POST'
            }).then(function(result) {
                self.set('showSpinner', false);
                if (result.message) {
                    self.notificationMessages.success(I18n.t("admin.flavors.flavor_add_success"));
                    NilavuURL.redirectTo('/admin/flavors');
                    self.refresh();
                } else {
                    self.notificationMessages.error(I18n.t("admin.flavors.flavor_add_failure"));
                }
            }).catch(function() {
                self.set('showSpinner', false);
                self.notificationMessages.error(I18n.t("admin.flavors.flavor_add_failure"));
            });

        }
    }

});
