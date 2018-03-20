import FilterProperties from 'nilavu/models/filter-properties';

export default Ember.Component.extend({
    tagName: 'tr',
    rawimageRegion: function() {
        return FilterProperties.byKey(this.get('rawimage.inputs'),"region");
    }.property('rawimage.inputs')

});
