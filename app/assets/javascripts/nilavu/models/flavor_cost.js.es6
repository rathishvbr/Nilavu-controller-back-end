import FilterProperties from 'nilavu/models/filter-properties';
import {setting} from 'nilavu/lib/computed';

const FlavorCost = Ember.Object.extend({
    costpermonth(storageType) {
        const storage = (storageType === 'HDD')
            ? FilterProperties.byKey(this.get('flavor.price'), "hdd_cost_month")
            : FilterProperties.byKey(this.get('flavor.price'), "ssd_cost_month");
            const monthCost = parseFloat(FilterProperties.byKey(this.get('flavor.price'), "cpu_cost_month")) + parseFloat(FilterProperties.byKey(this.get('flavor.price'), "ram_cost_month")) + parseFloat(storage);
            return monthCost.toFixed(3);
    },

    calcCost(cost, flav) {
        return flav * cost;
    },

    costperhour(storageType) {
        const storage = (storageType === 'HDD')
            ? this.get('hdd_cost_per_hour')
            : this.get('ssd_cost_per_hour');
        const hourCost = this.calcCost(this.get('vm_memory_cost_per_hour'), this.get('flavor.ram')) + this.calcCost(this.get('vm_cpu_cost_per_hour'), this.get('flavor.cpu')) + this.calcCost(storage, this.get('flavor.disk'));
        return hourCost.toFixed(3);
    },

    costPerHourDisk(storageType) {
        const storage = (storageType === 'HDD')
            ? this.get('hdd_cost_per_hour')
            : this.get('ssd_cost_per_hour');
        const hourCost = this.get('vm_memory_cost_per_hour');
        return hourCost;
    },

    storagePrice(storageType){
      const storage = (storageType === 'HDD')
          ? this.get('hdd_cost_per_hour')
          : this.get('ssd_cost_per_hour');
    return storage;
    }
});

FlavorCost.reopenClass({

    parseDisk(quota) {
        var parsed_quota = quota.allowed;
        var disk_type = "SSD";
        parsed_quota.forEach(function(c) {
            if (c.key === "DISK_TYPE") {
                disk_type = c.value;
            }
        });
        return disk_type;
    },

    all(resource, category, flavorsData) {

        var units = this.units = Em.A();
        const _quotas = category.quotas.quota;
        const flavorData = flavorsData;
        const _this = this;

        flavorsData.forEach(function(flav) {

            var quotaCost = "0",
                quotaDisk = "SSD",
                quotaIds = [],
                allocatedTo = "";
            status = "";
            if (_quotas.length > 0) {
                _quotas.forEach(function(c) {
                    if (c.name.trim() === flav.name && Ember.isBlank(c.allocated_to) && _this.parseDisk(c) === category.storageoption) {
                        quotaIds.pushObject(c.id);
                        allocatedTo = c.allocated_to;
                        quotaDisk = _this.parseDisk(c);
                        status = (c.status.toLowerCase() === 'unpaid' || c.status.toLowerCase() === 'paid')
                            ? c.status
                            : 'partialpaid';
                    }

                });
                //we have to move it to separate for quota
                var sameQuotas = _quotas.filter(function(c) {
                    if (c.name.trim() === flav.name && Ember.isBlank(c.allocated_to) && _this.parseDisk(c) === category.storageoption) {
                        return c;
                    }
                });
            }

            var params = {
                name: flav.name,
                flavor: flav,
                currency: resource.currency,
                vm_cpu_cost_per_hour: FilterProperties.byKey(flav.price, "cpu_cost_hour"),
                vm_memory_cost_per_hour: FilterProperties.byKey(flav.price, "ram_cost_hour"),
                vm_bandwidth_cost_per_hour: "0.00",
                container_cpu_cost_per_hour: resource.container_cpu_cost_per_hour,
                container_memory_cost_per_hour: resource.container_ram_cost_per_hour,
                hdd_cost_per_hour: FilterProperties.byKey(flav.price, "hdd_cost_hour"),
                ssd_cost_per_hour: FilterProperties.byKey(flav.price, "ssd_cost_hour"),
                storage_cost_per_hour: resource.storage_cost_per_hour,
                quota_cost: quotaCost,
                quota_disk_type: quotaDisk,
                quota_ids: quotaIds,
                allocated_to: allocatedTo,
                status: status,
                quota_count: Ember.isBlank(allocatedTo) && !Ember.isBlank(quotaIds)
                    ? sameQuotas.length
                    : ""
            };

            units.pushObject(FlavorCost.create(params));

        });
        return units;
    },

    allForProducts(model, flav) {
        var units = this.units = Em.A();
        const storageOption = "SSD";
        var params = {
            name: model.subresource.name,
            flavor: flav,
            currency: model.subresource.currency,
            vm_cpu_cost_per_hour: FilterProperties.byKey(flav.price, "cpu_cost_hour"),
            vm_memory_cost_per_hour: FilterProperties.byKey(flav.price, "ram_cost_hour"),
            vm_bandwidth_cost_per_hour: "0.00",
            container_cpu_cost_per_hour: model.subresource.container_cpu_cost_per_hour,
            container_memory_cost_per_hour: model.subresource.container_ram_cost_per_hour,
            hdd_cost_per_hour: FilterProperties.byKey(flav.price, "hdd_cost_hour"),
            ssd_cost_per_hour: FilterProperties.byKey(flav.price, "ssd_cost_hour"),
            storage_cost_per_hour: model.subresource.storage_cost_per_hour
        };
        units.pushObject(FlavorCost.create(params));
        return units;
    }

});

export default FlavorCost;
