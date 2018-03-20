import {orgCategoryPanel} from 'nilavu/components/org-category-panel';

export default orgCategoryPanel('domain', {
    name: function() {
        return this.get('model.details');
    }.property('model.details')
});
