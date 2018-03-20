import {buildCategoryPanel} from 'nilavu/components/edit-category-panel';
import FilterProperties from 'nilavu/models/filter-properties';

export default buildCategoryPanel('cpu', {

    content_cpu_cores: function() {
        return I18n.t("vm_management.cpu.content_cpu_cores");
    }.property(),

    cpu_cores: function() {
        return FilterProperties.byKey(this.get('model.inputs'), "cpu");
    }.property('model.inputs'),

    osName: function() {
        return this.get('model.tosca_type').split('.')[2];
    }.property('model.tosca_type'),

    //has to remove
    disableMonitor: function() {
        return FilterProperties.disable(this.get('model.tosca_type'));
    }.property('model.tosca_type')
});
