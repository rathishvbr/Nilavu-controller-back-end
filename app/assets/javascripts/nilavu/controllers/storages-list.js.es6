import showModal from 'nilavu/lib/show-modal';
export default Ember.Controller.extend({
    title: "Storages",
    viewIcons: false,
    loading: false,
    buckets: Em.computed.alias('model'),

    textCreateStorage: function() {
        return I18n.t("bucket.create_storage");
    }.property(),

    actions: {
        bucketCreate() {
            showModal('storageBucketCreate', {
                title: 'bucket.title',
                smallTitle: true,
                titleCentered: true,
                model: this.get('buckets')
            });
        }
    }
});
