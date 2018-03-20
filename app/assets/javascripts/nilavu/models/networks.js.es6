const Networks = Ember.Object.extend({});
Networks.reopenClass({
    ALL_SUBNETS: [
        "private_ipv4", "public_ipv4", "private_ipv6", "public_ipv6"
    ],

    enabled(data) {
        const enabledNetworks = data.filter(function(x) {
            if (x.enabled) {
                return x;
            }
        });
        return enabledNetworks;
    },

    ipSplitter(networkIps) {
        if (!Ember.isEmpty(networkIps)) {
            return networkIps.split(',');
        }
        return [];
    },

    available(regions, regionOption) {
        const matchedRegion = regions.filter(function(c) {
            if (Em.isEqual(c.name, regionOption)) {
                return c;
            }
        });

        let subnets = [];

        if (matchedRegion.length > 0) {
            const region = matchedRegion[0];
            subnets = this.ALL_SUBNETS.map(function(subnet) {
                return {
                    name: subnet,
                    enabled: region[subnet],
                    title: "vm_management.network." + subnet
                };
            });

        }
        return subnets;
    },

    aggregate(data) {
        const self = this;
        if (data.length < 0) {
            return [];
        }
        const filterData = this.ALL_SUBNETS.reduce(function(a, b) {
            const filn = data.filterBy('key', b);
            if (filn && filn.length > 0) {
                return a.concat({
                    key: b,
                    value: filn[0].value,
                    title: "vm_management.network." + b
                });
            }
            return a;
        }, []);
        let network = [];
        if (filterData && filterData.length > 0) {
            filterData.forEach(function(c) {
                var filterIp = self.ipSplitter(c.value);
                filterIp.forEach(function(v) {
                    network.pushObject({key: c.key, value: v, title: c.title});
                });
            });
            return network;
        }
    }
});

export default Networks;
