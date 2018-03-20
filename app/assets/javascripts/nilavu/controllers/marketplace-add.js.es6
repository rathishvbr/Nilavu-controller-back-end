import NilavuURL from 'nilavu/lib/url';
import FilterProperties from 'nilavu/models/filter-properties';

export default Ember.Controller.extend({
    showSpinner: false,


    marketTitle: function() {
        return I18n.t("marketplaces.add");
    }.property(),

    categoryData: function() {
        let category = [];
        category.pushObject(this.get('categoryOption'));
        this.set('categories', category);
    }.observes('categoryOption'),

    categoryType: function(){
    const category = Nilavu.SiteSettings.default_categories.split("|").filter(function(cat){
      return (cat !== 'dashboard');
    });
    return category;
    }.property('category'),

    refresh() {
        this.setProperties({
            marketplaceName: '',
            categoryOption: '',
            version: '',
            image: '',
            websiteURL: ''
        });
    },

    submitDisabled: function() {
        if (this.get('fieldValidation.failed')) {
            return true;
        }
    }.property('fieldValidation.failed'),

    fieldValidation: function() {
        if (Ember.isEmpty(this.get('marketplaceName')) || Ember.isEmpty(this.get('categoryOption')) || Ember.isEmpty(this.get('version'))  || Ember.isEmpty(this.get('image')) || Ember.isEmpty(this.get('websiteURL')) || Ember.isEmpty(this.get('model.selectedRawimage'))) {
            return ({failed: true});
        }
    }.property('marketplaceName', 'categoryOption',  'version', 'image', 'model.selectedRawimage'),

    getData() {
        var inputs = [
            {
                key: "raw_image_id",
                value: this.get('model.selectedRawimage.id')
            }, {
                key: "region",
                value: FilterProperties.byKey(this.get('model.selectedRawimage.inputs'), "region")
            },
            // TO-DO we should get this data from some resource
            {
                key: "ram",
                value: "2 GB"
            }, {
                key: "cpu",
                value: "2 Core"
            }, {
                key: "hdd",
                value: "10 GB"
            }
        ];

        var plans = [
            {
                key: 'version',
                value: this.get('version')
            }
        ];

        return {
            flavor: this.get('marketplaceName'),
            cattype: this.get('categoryOption'),
            catorder: "10" ,
            image: this.get('image'),
            provided_by: "vertice",
            url: this.get('websiteURL'),
            plans: JSON.stringify(plans),
            status: this.constants.INPROGRESS,
            inputs: JSON.stringify(inputs)
        };
    },

    actions: {
        createSaaSProduct: function() {
            var self = this;
            this.set("showSpinner", true);
            Nilavu.ajax("/marketplaces", {
                data: self.getData(),
                type: 'POST'
            }).then(function(result) {
                self.set('showSpinner', false);
                if (result.id) {
                    const id = result.id;
                    self.notificationMessages.success(I18n.t("marketplaces.saas_product_created"));
                    NilavuURL.routeTo('/marketplaces/activity/predeploy/' + id);
                    self.refresh();
                } else {
                    self.notificationMessages.error(I18n.t("marketplaces.saas_product_failed"));
                    self.refresh();
                }
            }).catch(function() {
                self.set('showSpinner', false);
                self.notificationMessages.error(I18n.t("marketplaces.saas_product_failed"));
                self.refresh();
            });

        }
    }
});
