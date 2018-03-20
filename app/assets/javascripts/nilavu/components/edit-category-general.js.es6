import NilavuURL from 'nilavu/lib/url';
import {buildCategoryPanel} from 'nilavu/components/edit-category-panel';

export default buildCategoryPanel('general', {
    editingResource: false,
    editingCost: false,
    regionable: null,

    _initPanels: function() {
        this.set('category.packType', 'virtualmachine');
    }.on('init'),

    category: function() {
        return this.get('category');
    }.property("category"),

    flavorsDatas: function() {
        return this.get('category.flavors.flavors_data');
    }.property('category.flavors'),

    //TO-DO togglePropert("subDomainValid"), if not don't allow to launch
    subDomain: function() {
        this.set('category.subdomain', this.get('category.random_name'));
        const subdomain = this.get('category.random_name');
        return subdomain.trim().length > 0
            ? subdomain
            : "launch.domain_name";
    }.property('category.random_name'),

    domainChanged: function() {
        this.set('category.subdomain', this.get('subDomain'));
    }.observes('subDomain'),

    domain: function() {
        const domain = this.get('category.domain');
        return domain.trim().length > 0
            ? domain
            : "launch.domain";
    }.property('category.domain'),

    regions: Em.computed.alias('category.regions'),

    // We need to get the regions from the Draft model
    showSubRegions: function() {
        if (Ember.isEmpty(this.get('category.regions'))) {
            return null;
        }

        return this.get('category.regions');

    }.property('category.regions'),

    resources: function() {
        const _regionOption = this.get('regionOption');
        const fullFlavor = this.get('regions').filter(function(c) {
            if (c.name === _regionOption) {
                return c;
            }
        });
        return fullFlavor;
    }.property('category.regionoption', 'regionOption'),

    flavors: function() {
        const _regionOption = 'flavors';
        const fullFlavor = this.get('regions').filter(function(c) {
            if (c.name === _regionOption) {
                return c;
            }
        });

        return fullFlavor;
    }.property('category.regionoption', 'regionOption'),

    flavorsCompressor: function() {
        if (this.get('category.regionoption') != undefined) {

            var flavorsDatas = [];
            let region = this.get('category.regionoption');
            this.get('flavorsDatas').forEach(function(result) {
                let reg = result.regions;
                reg.forEach(function(regionfromlist) {
                    if (region == regionfromlist) {
                        flavorsDatas.pushObject(result);
                    }
                });
            });
            this.set('flavorsData', flavorsDatas);
        }
    }.observes('regionOption', 'category.regionoption'),

    flavorsEmptyCheck: function() {
        if (Ember.isEmpty(this.get('flavorsData'))) {
            this.set("emptyflav", true);
        } else {
            this.set("emptyflav", false);
        }
    }.observes('flavorsData'),

    regionChanged: function() {
        if (!this.editingResource) {
            this.$(".hideme2").slideToggle(150);
            this.toggleProperty('editingResource');
        }
        if (this.editingCost) {
            this.toggleProperty('editingCost');
            $(".hideme3").slideToggle(250);
        }
        this.set('category.regionoption', this.get('regionOption'));

    }.observes('regionOption'),

    regionOption: function() {
        if (Ember.isEmpty(this.get('category.regions')) && this.get('category.regionoption') && this.get('category.regionoption').trim().length > 0) {
            return this.get('category.regionoption');
        }
        return null;
    }.property('category.regions', 'category.regionoption'),

    resourceOption: function() {
        if (Ember.isEmpty(this.get('category.regions')) && this.get('category.resourceoption').trim().length > 0) {
            return this.get('category.resourceoption');

        }
        return null;
    }.property('category.regions', 'category.resourceoption'),

    resourceChanged: function() {
        this.set('category.resourceoption', this.get('resourceOption'));
        if (!this.editingCost) {
            $(".hideme3").slideToggle(250);
            this.toggleProperty('editingCost');
        }
    }.observes('resourceOption'),

    storageOption: function() {
        return this.get('category.storageoption');
    }.property('category.storageoption'),

    storageChange: function() {
        this.set('disableDisk', '');
        this.set('category.storageoption', '');
        if (Ember.isEmpty(this.get('category.regions'))) {
            return;
        }

        const region = this.get('resources');

        const regionArrLen = region.length;

        if (regionArrLen > 0) {
            const firstRegion = region[0];

            if (firstRegion.hide_disks) {
                const hideDisk = firstRegion.hide_disks.trim() === 'SSD'
                    ? 'SSD'
                    : (firstRegion.hide_disks.trim() === 'HDD'
                        ? 'HDD'
                        : "");
                this.set('disableDisk', hideDisk);
            }

            const priority = firstRegion.prioritize_ssd
                ? 'SSD'
                : 'HDD';

            this.set('category.storageoption', priority);
        } else {
            this.set('category.storageoption', 'HDD');
        }
    }.observes('regionOption'),

    storageChanged: function() {
        this.set('category.storageoption', this.get('storageOption'));
    }.observes('storageOption'),

    actions: {
        showCategoryTopic() {
            NilavuURL.routeTo(this.get('category.topic_url'));
            return false;
        }
    }

});
