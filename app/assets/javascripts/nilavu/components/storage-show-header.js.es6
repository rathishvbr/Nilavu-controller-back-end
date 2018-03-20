import showModal from 'nilavu/lib/show-modal';
export default Ember.Component.extend({
    bucketfiles: Em.computed.alias('model'),
    bucket_name: Em.computed.alias('model.message.bucket_name'),
    access_key: Em.computed.alias('model.args.access_key'),
    secret_key: Em.computed.alias('model.args.secret_key'),
    server: Em.computed.alias('model.args.server'),
    https: Em.computed.alias('model.args.https'),

    totalStorage: Em.computed.alias('model.message.spaced.buckets_size_humanized'),
    totalObjects: Em.computed.alias('model.message.spaced.buckets_count'),

    textTotalStorage: function() {
        return I18n.t("bucket.total_storage");
    }.property(),

    textTotalObjects: function() {
        return I18n.t("bucket.total_objects");
    }.property(),

    actions: {
        upload() {
            showModal('storageObjectUpload', {
                title: 'bucket.file',
                smallTitle: true,
                titleCentered: false,
                model: this.get('bucketfiles')
            }).setProperties({bucketName: this.get('bucket_name'), access_key: this.get('access_key'), secret_key: this.get('secret_key'), server: this.get('server'), https: this.get('https')});
        }
    }
});
