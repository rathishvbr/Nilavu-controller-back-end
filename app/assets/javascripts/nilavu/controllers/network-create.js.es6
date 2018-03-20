import ModalFunctionality from 'nilavu/mixins/modal-functionality';
import Networks from 'nilavu/models/networks';

export default Ember.Controller.extend(ModalFunctionality, {

    formSubmitted: false,
    showSpinner: false,

    networks: function() {
        return Networks.available(this.get("model.regions"), this.get("model.resource.region"));
    }.property('model.regions', 'model.resource.region'),

    rules: function() {
        let rules = [];
        const self = this;
        rules = Networks.enabled(this.get('networks')).map(function(enabled) {
            const selectedNetwork = self.get('model.network.' + enabled.name);
            if (selectedNetwork) {
                return selectedNetwork;
            }
        });

        return rules;
    }.property('model.network', 'networks'),

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

    policy_data() {
        var date = new Date();
        var policies = [
            {
                name: this.constants.NETWORKATTACHPOLICY,
                ptype: this.constants.NETWORK,
                resources: [],
                rules: this.get('rules'),
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
            policies: self.policy_data(),
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
        submit: function() {
            var self = this;
            this.set('showSpinner', true);
            Nilavu.ajax("/t/" + this.get('model').id, {
                data: self.getData(),
                type: 'PUT'
            }).then(function(result) {
                self.set('showSpinner', false);
                if (result.success) {
                    self.notificationMessages.success(I18n.t("vm_management.network.attach_success"));
                } else {
                    self.notificationMessages.error(I18n.t("vm_management.network.attach_error"));
                }
                self.send("closeModal");
                window.location.reload();

            }).catch(function() {
                self.set('showSpinner', false);
                self.notificationMessages.error(I18n.t("vm_management.network.attach_error"));
                self.send("closeModal");
            });
        }
    }

});
