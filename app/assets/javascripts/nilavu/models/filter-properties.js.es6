const FilterProperties = Ember.Object.extend({});
FilterProperties.reopenClass({
    dontMonitor: [
        "freebsd", "windows"
    ],
    ALL_SUBNETS: [
        "private_ipv4", "public_ipv4", "private_ipv6", "public_ipv6"
    ],

    byKey(inputs, key) {
        if (Em.isBlank(inputs))
            return "";
        if (Em.isBlank(inputs.filterBy('key', key)[0]))
            return "";
        return inputs.filterBy('key', key)[0].value;
    },

    bykeyname(inputs, key) {
        if (Em.isBlank(inputs))
            return "";
        if (Em.isBlank(inputs.filterBy('key', key)[0]))
            return "";
        return inputs.filterBy('key', key)[0];
    },

    getpair(inputs) {
        let subnets = [];
        var self = this;
        this.ALL_SUBNETS.map(function(a) {
            let finder = self.bykeyname(inputs, a);
            if (finder) {
                subnets.pushObject(finder);
            }
        });
        return subnets;
    },

    //has to remove
    disable(data) {
        const toscaName = data.split('.')[2];
        const disbletoscaName = this.dontMonitor.filter(x => x === toscaName)[0];
        if (toscaName === disbletoscaName) {
            return true;
        }
        return false;

    },

    getData(data, reqAction, category_data) {
        return {
            id: data.id,
            account_id: data.topicTrackingState.currentUser.email,
            cat_id: data.asms_id,
            name: data.name,
            req_action: reqAction,
            cattype: data.tosca_type.split(".")[1],
            category: category_data
        };
    }
});

export default FilterProperties;
