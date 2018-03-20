import {buildCategoryPanel} from 'nilavu/components/edit-category-panel';
import FilterProperties from 'nilavu/models/filter-properties';

export default buildCategoryPanel('info', {

    title: function() {
        return I18n.t("vm_management.info.content_title");
    }.property(),

    resources_title: function() {
        return I18n.t("vm_management.info.content_resources_title");
    }.property(),

    network_title: function() {
        return I18n.t("vm_management.network.tab_title");
    }.property(),

    content_disk_type: function() {
        return I18n.t("vm_management.info.content_disk_type");
    }.property(),

    content_disk_size: function() {
        return I18n.t("vm_management.info.content_disk_size");
    }.property(),

    content_cpu: function() {
        return I18n.t("vm_management.info.content_cpu");
    }.property(),

    content_ram: function() {
        return I18n.t("vm_management.info.content_ram");
    }.property(),

    content_id: function() {
        return I18n.t("vm_management.info.content_id");
    }.property(),

    content_name: function() {
        return I18n.t("vm_management.info.content_name");
    }.property(),

    content_domain: function() {
        return I18n.t("vm_management.info.content_domain");
    }.property(),

    content_state: function() {
        return I18n.t("vm_management.info.content_state");
    }.property(),

    content_host: function() {
        return I18n.t("vm_management.info.content_host");
    }.property(),

    content_region: function() {
        return I18n.t("vm_management.info.content_region");
    }.property(),

    content_flavor: function() {
        return I18n.t("vm_management.info.content_flavor");
    }.property(),

    content_start_time: function() {
        return I18n.t("vm_management.info.content_start_time");
    }.property(),

    content_hdd_size: function() {
        return I18n.t("vm_management.info.content_hdd_size");
    }.property(),

    content_cpu_cores: function() {
        return I18n.t("vm_management.cpu.content_cpu_cores");
    }.property(),

    content_ram_size: function() {
        return I18n.t("vm_management.ram.content_ram_size");
    }.property(),

    content_os: function() {
        return I18n.t("vm_management.info.content_os");
    }.property(),

    content_ipv4: function() {
        return I18n.t("vm_management.network.content_ipv4");
    }.property(),

    content_ipv6: function() {
        return I18n.t("vm_management.network.content_ipv6");
    }.property(),

    content_private: function() {
        return I18n.t("vm_management.network.content_private");
    }.property(),

    content_public: function() {
        return I18n.t("vm_management.network.content_public");
    }.property(),

    showBrandImage: function() {
        const fullBrandUrl = this.get('model.tosca_type');
        if (Em.isNone(fullBrandUrl)) {
            return `<img src="/images/brands/dummy.png" />`.htmlSafe();
        }

        const split = fullBrandUrl.split('.');

        if (split.length >= 2) {
            var brandImageUrl = split[2].trim().replace(/\s/g, '');
            return `<img src="/images/brands/${brandImageUrl}.png" />`.htmlSafe();
        }

        return `<img src="/images/brands/ubuntu.png" />`.htmlSafe();
    }.property('model.tosca_type', 'model.components'),

    id: function() {
        return this.get('model.id');
    }.property('id'),

    name: function() {
        return this.get('model.name');
    }.property('model.name'),

    domain: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"domain");
    }.property('model.inputs'),

    cpu_cores: function() {
         let cpu = parseInt(FilterProperties.byKey(this.get('model.inputs'),"cpu"));
             return cpu;
    }.property('model.inputs'),

    ram: function() {
     let ram = parseInt(FilterProperties.byKey(this.get('model.inputs'),"ram"));
         return ram;
    }.property('model.inputs'),

    disk_type: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"storage_hddtype");
    }.property('model.inputs'),

    disk_size: function() {
     let disk = FilterProperties.byKey(this.get('model.inputs'),"hdd");
     if (disk === "") {
      disk = FilterProperties.byKey(this.get('model.inputs'),"disk");
     }
     disk = parseInt(disk);
        return disk;
    }.property('model.inputs'),

    host: function() {
        return FilterProperties.byKey(this.get('model.outputs'),"vnchost");
    }.property('model.outputs'),

    region: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"region");
    }.property('model.inputs'),


    ipv4Private: function() {
        return this._checked(FilterProperties.byKey(this.get('model.inputs'),"private_ipv4"));
    }.property('model.inputs'),

    ipv4Public: function() {
        return this._checked(FilterProperties.byKey(this.get('model.inputs'),"public_ipv4"));
    }.property('model.inputs'),

    ipv6Private: function() {
        return this._checked(FilterProperties.byKey(this.get('model.inputs'),"private_ipv6"));
    }.property('model.inputs'),

    ipv6Public: function() {
        return this._checked(FilterProperties.byKey(this.get('model.inputs'),"public_ipv6"));
    }.property('model.inputs'),

    _checked(value) {
        if (value === "true") {
            return true;
        } else {
            return false;
        }
    },

    createdAt: function() {
        return new Date(this.get('model.created_at'));
    }.property('model.created_at'),

    status: function() {
        return this.get('model.state');
    }.property('model.state')
});
