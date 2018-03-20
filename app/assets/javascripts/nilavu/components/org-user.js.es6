import {orgCategoryPanel} from 'nilavu/components/org-category-panel';

export default orgCategoryPanel('user', {

    userName: function() {
        return this.get('model.first_name');
    }.property('model.first_name'),

    email: function() {
        return this.get('model.email');
    }.property('model.email')
});
