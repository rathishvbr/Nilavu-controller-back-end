import {buildCategoryPanel} from 'nilavu/components/edit-category-panel';
import FilterProperties from 'nilavu/models/filter-properties';

export default buildCategoryPanel('ram', {

    content_ram_size: function() {
        return I18n.t("vm_management.ram.content_ram_size");
    }.property(),

    ram: function() {
      return FilterProperties.byKey(this.get('model.inputs'),"ram");
    }.property('model.inputs')
});
