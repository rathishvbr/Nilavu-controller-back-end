
export default Ember.Controller.extend({
  title: I18n.t('bucket.buckets'),
  bucketfiles: Em.computed.alias('model'),
  bucket_name: Em.computed.alias('model.message.bucket_name'),
  selectedItem: null,


});
