import {buildCategoryPanel} from 'nilavu/components/edit-category-panel';

export default buildCategoryPanel('apikey', {

    api_key: function() {
        return this.get('model.api_key');
    }.property('model.api_key'),

    createdAt: function() {
        return this.get('model.created_at');
    }.property('model.created_at')
});
