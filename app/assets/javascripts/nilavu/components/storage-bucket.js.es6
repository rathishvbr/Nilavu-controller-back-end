import { formatFileSize } from 'nilavu/helpers/file-formats';
import showModal from 'nilavu/lib/show-modal';
export default Ember.Component.extend({

  text_total_objects: function() {
    return I18n.t('bucket.total_objects');
  }.property(),

  total_size: function() {
    return formatFileSize(parseInt(this.get('bucket').size_humanized));
  }.property(),

  actions: {

      destroy() {
          showModal('storageBucketDestroy', {
              title: 'bucket.destroy',
              smallTitle: true,
              titleCentered: true,
              model: this.get('model')
          }).setProperties({bucketName: this.get('bucket.name')});
      }
  }

});
