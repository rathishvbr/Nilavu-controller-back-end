import {buildCategoryPanel} from 'nilavu/components/edit-category-panel';
import FilterProperties from 'nilavu/models/filter-properties';

export default buildCategoryPanel('network', {

    networkTableVisible: true,
    networkChartVisible: false,

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

    content_public_ipv4: function() {
        return I18n.t("vm_management.network.content_public_ipv4");
    }.property(),

    content_private_ipv4: function() {
        return I18n.t("vm_management.network.content_private_ipv4");
    }.property(),

    content_public_ipv6: function() {
        return I18n.t("vm_management.network.content_public_ipv6");
    }.property(),

    content_private_ipv6: function() {
        return I18n.t("vm_management.network.content_private_ipv6");
    }.property(),

    content_domain: function() {
        return I18n.t("vm_management.info.content_domain");
    }.property(),

    content_start_time: function() {
        return I18n.t("vm_management.info.content_start_time");
    }.property(),

    domain: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"domain");
    }.property('model.domain'),

    createdAt: function() {
        return new Date(this.get('model.created_at'));
    }.property('model.created_at'),

    privateipv4: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"privateipv4");
    }.property('model.outputs'),

    publicipv4: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"publicipv4");
    }.property('model.outputs'),

    privateipv6: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"privateipv6");
    }.property('model.outputs'),

    publicipv6: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"publicipv6");
    }.property('model.outputs'),

    osName: function(){
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

    showContentPrivateIPV4: function() {
        if (!this._checked(FilterProperties.byKey(this.get('model.inputs'),"ipv4private"))) {
            return "contentDisable";
        }
    }.property('model.inputs'),

    showContentPublicIPV4: function() {
        if (!this._checked(FilterProperties.byKey(this.get('model.inputs'),"ipv4public"))) {
            return "contentDisable";
        }
    }.property('model.inputs'),

    showContentPrivateIPV6: function() {
        if (!this._checked(FilterProperties.byKey(this.get('model.inputs'),"ipv6private"))) {
            return "contentDisable";
        }
    }.property('model.inputs'),

    showContentPublicIPV6: function() {
        if (!this._checked(FilterProperties.byKey(this.get('model.inputs'),"ipv6public"))) {
            return "contentDisable";
        }
    }.property('model.inputs'),

    ipv4Private: function() {
        return this._checked(FilterProperties.byKey(this.get('model.inputs'),"ipv4private"));
    }.property('model.inputs'),

    ipv4Public: function() {
        return this._checked(FilterProperties.byKey(this.get('model.inputs'),"ipv4public"));
    }.property('model.inputs'),

    ipv6Private: function() {
        return this._checked(FilterProperties.byKey(this.get('model.inputs'),"ipv6private"));
    }.property('model.inputs'),

    ipv6Public: function() {
        return this._checked(FilterProperties.byKey(this.get('model.inputs'),"ipv6public"));
    }.property('model.inputs'),

    _checked(value) {
        if (value === "true") {
            return true;
        } else {
            return false;
        }
    },

    actions: {
        showTable() {
            this.set('networkTableVisible', true);
            this.set('networkChartVisible', false);
        },

        showCharts() {
            this.set('networkTableVisible', false);
            this.set('networkChartVisible', true);
        }
    }

});
