export default Ember.Component.extend({
    tagName: 'tr',
    showSpinner: false,

    name: Ember.computed.alias('network.key'),
    ipAddress: Ember.computed.alias('network.value'),
    title: Ember.computed.alias('network.title'),

    content_title: function() {
        return I18n.t(this.get('title'));
    }.property(),

    components: function() {
        const self = this;
        var data = this.get('model.components').reduce(function(a, b) {
            if (self.get('model.components') && self.get('model.components').length > 0) {
                return b[0].id.w();
            }
            return a;
        }, []);
        return data;
    }.property('model.components'),

    submitDisabled: function() {
        if (this.get('sortNetworks').length == 1) {
            return true;
        }
    }.property('sortNetworks'),

    policies_data() {
        var date = new Date();
        var policies = [
            {
                name: this.constants.NETWORKDETACHPOLICY,
                ptype: this.constants.NETWORK,
                resources: [],
                rules: [
                    {
                        key: this.get('name'),
                        value: this.get('ipAddress').trim()
                    }
                ],
                properties: [],
                status: "initializing",
                created_at: date,
                updated_at: date
            }
        ];
        return JSON.stringify(policies);
    },

    getData() {
        var self = this;
        return {
            id: this.get('model').id,
            asm_id: self.get('model').id,
            name: self.get('model').name,
            components: this.get('components'),
            tosca_type: self.get('model.tosca_type'),
            policies: self.policies_data(),
            inputs: self.get('model.inputs'),
            outputs: self.get('model.outputs'),
            state: self.get('model.state'),
            status: self.get('model.status.message'),
            created_at: self.get('model.created_at'),
            account_id: self.get("model.topicTrackingState.currentUser.email"),
            cat_id: this.get('model').asms_id,
            cattype: this.get('model').tosca_type.split(".")[1],
            category: "operations",
            req_action: "assembly.network.update"
        };
    },

    actions: {
        removeNetwork: function() {
            this.getData();
            var self = this;
            this.set('showSpinner', true);
            Nilavu.ajax("/t/" + this.get('model').id, {
                data: self.getData(),
                type: 'PUT'
            }).then(function(result) {
                self.set('showSpinner', false);
                if (result.success) {
                    self.notificationMessages.success(I18n.t("vm_management.network.removed_success"));
                } else {
                    self.notificationMessages.error(I18n.t("vm_management.network.removed_error"));
                }

            }).catch(function() {
                self.set('showSpinner', false);
                self.notificationMessages.error(I18n.t("vm_management.network.removed_error"));
            });
        }
    }
});
