import {observes} from 'ember-addons/ember-computed-decorators';

export default Ember.Component.extend({

    classNameBindings: [
        ':pad_0', ':flavor-col-sm-4'
    ],

    unitFlav: function() {
        return this.get('flavor');
    }.property('flavor'),

    flavorName: Em.computed.alias('unitFlav.name'),

    fcpu: function() {
        return this.get('unitFlav.flavor.cpu');
    }.property('unitFlav.cpu'),

    fmemory: function() {
        return this.get('unitFlav.flavor.ram');
    }.property('unitFlav.memory'),

    fstorage: function() {
       return this.get('unitFlav.flavor.disk');
    }.property('unitFlav.storage'),

    // fbandwidth: function() {
    //     return this.get('unitFlav').bandwidth();
    // }.property('unitFlav.bandwidth'),

    unitChanged: function() {
        this.set('category.unitoption', this.get('unitFlav'));
    },

    quotaProduct: function() {
        return !Ember.isEmpty(this.get('unitFlav.quota_count'));
    }.property('category.storageoption'),

    quotasCount: function() {
        if (!Ember.isEmpty(this.get('unitFlav.quota_count'))) {
            return this.get('unitFlav.quota_count');
        }
    }.property('unitFlav'),

    change: function() {
        Ember.run.once(this, 'unitChanged');
    },

    @observes('flavor.@each')_rerenderOnChange() {
        this.rerender();
    }

});
