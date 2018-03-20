import {buildCategoryPanel} from 'nilavu/components/edit-category-panel';
import FilterProperties from 'nilavu/models/filter-properties';
import showModal from 'nilavu/lib/show-modal';
import Networks from 'nilavu/models/networks';
import ModalFunctionality from 'nilavu/mixins/modal-functionality';

export default buildCategoryPanel('network', {

    networkTableVisible: true,
    networkChartVisible: false,

    submitDisabled: function() {
        return (Ember.isEqual(this.get('model.state'), "initializing") || Ember.isEqual(this.get('model.state'), 'preerror'));
    }.property('model.state'),

    title: function() {
        return I18n.t("vm_management.info.content_title");
    }.property(),

    table_title: function() {
        return I18n.t("vm_management.network.table_title");
    }.property(),

    table_description: function() {
        return I18n.t("vm_management.network.table_description");
    }.property(),

    monitoring_title: function() {
        return I18n.t("vm_management.network.monitoring_title");
    }.property(),

    monitoring_description: function() {
        return I18n.t("vm_management.network.monitoring_description");
    }.property(),

    content_dns_provider: function() {
        return I18n.t("vm_management.network.content_dns_provider");
    }.property(),

    content_domain: function() {
        return I18n.t("vm_management.info.content_domain");
    }.property(),

    content_start_time: function() {
        return I18n.t("vm_management.info.content_start_time");
    }.property(),

    domain: function() {
        return FilterProperties.byKey(this.get('model.inputs'), "domain");
    }.property('model.inputs'),

    bacupId: function() {
        return FilterProperties.byKey(this.get('model.inputs'), "backup_id");
    }.property('model.outputs'),

    createdAt: function() {
        return new Date(this.get('model.created_at'));
    }.property('model.created_at'),

    osName: function() {
        return this.get('model.tosca_type').split('.')[2];
    }.property('model.tosca_type'),

    //has to remove
    disableMonitor: function() {
        return FilterProperties.disable(this.get('model.tosca_type'));
    }.property('model.tosca_type'),

    visibleTable: function() {
        if (!this.get('networkTableVisible')) {
            return "row contentDisable";
        } else {
            return "row contentVisible";
        }
    }.property('networkTableVisible'),

    visibleCharts: function() {
        if (!this.get('networkChartVisible')) {
            return "row contentDisable";
        } else {
            return "row contentVisible";
        }
    }.property('networkChartVisible'),

    hasOutputs: Em.computed.notEmpty('model.outputs'),

    networkListEmpty: function() {
        return Em.isEmpty(this.get('sortNetworks'));
    }.property("sortNetworks"),

    actionBackupIP: function() {
        return !Em.isEmpty(this.get('bacupId'));
    }.property("sortNetworks"),

    rules(properties) {
        let rules = [];
        properties.map(function(enabled) {
            if (enabled.value) {
                rules.pushObject({
                    key: enabled.key,
                    value: (enabled.value.split(",").length).toString()
                });
            }
        });
        return rules;
    },

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

    sortNetworks: function() {
        if (this.get('hasOutputs')) {
            return Networks.aggregate(this.get('model.outputs'));
        }
    }.property('model.outputs'),

    policy_data(properties) {
        var date = new Date();
        var policies = [
            {
                name: this.constants.NETWORKATTACHPOLICY,
                ptype: this.constants.NETWORK,
                resources: [],
                rules: this.rules(properties),
                properties: properties,
                status: "initializing",
                created_at: date,
                updated_at: date
            }
        ];
        return JSON.stringify(policies);
    },

    getData(properties) {
        var self = this;
        return {
            id: this.get('model').id,
            asm_id: self.get('model').id,
            name: self.get('model').name,
            components: this.get('components'),
            tosca_type: self.get('model.tosca_type'),
            policies: self.policy_data(properties),
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

    assignParentIp(rules) {
        var self = this;
        Nilavu.ajax("/t/" + this.get('model').id, {
            data: self.getData(rules),
            type: 'PUT'
        }).then(function(result) {
            self.set('showAttachNetworkSpinner', false);
            if (result.success) {
                self.notificationMessages.success(I18n.t("vm_management.network.attach_success"));
            } else {
                self.notificationMessages.error(I18n.t("vm_management.network.attach_error"));
            }
            window.location.reload();

        }).catch(function() {
            self.set('showAttachNetworkSpinner', false);
            self.notificationMessages.error(I18n.t("vm_management.network.attach_error"));
        });
    },

    actions: {
        showTable() {
            this.set('networkTableVisible', true);
            this.set('networkChartVisible', false);
        },

        showCharts() {
            this.set('networkTableVisible', false);
            this.set('networkChartVisible', true);
        },

        attache() {
            showModal('networkCreate', {
                model: this.get("model"),
                title: 'vm_management.network.modal_title',
                close: true,
                smallTitle: false,
                titleCentered: true,
                modalSize: "network-modal-size"
            });

        },

        attacheVmIp() {
            var self = this;
            this.set("showAttachNetworkSpinner", true);
            Nilavu.ajax("/backup/" + this.get('bacupId'), {type: 'GET'}).then(function(result) {
                if (result.success) {
                    let properties = FilterProperties.getpair(result.message.backups_per.body[0].outputs);
                    self.assignParentIp(properties);
                } else {
                    self.notificationMessages.error(I18n.t("vm_management.network.attach_error"));
                }
            }).catch(function() {
                self.set("showAttachNetworkSpinner", false);
                self.notificationMessages.error(I18n.t("vm_management.network.attach_error"));

            });
        }
    }

});
