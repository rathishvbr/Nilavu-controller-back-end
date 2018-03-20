import {formatFileIcons, formatFileSize} from 'nilavu/helpers/file-formats';
import { observes} from 'ember-addons/ember-computed-decorators';
import showModal from 'nilavu/lib/show-modal';
export default Ember.Component.extend({
    tagName: 'tr',
    classNameBindings: ['del-up-cover'],

    spinnerDestroyIn: false,

    name: Em.computed.alias('usage.key'),
    bucket_name: Em.computed.alias('bucketName'),
    downloadURL: Em.computed.alias('usage.private_url'),

    showDestroySpinner: function() {
        return this.get('spinnerDestroyIn');
    }.property('spinnerDestroyIn'),

    sizeWithUnits: function() {
        return formatFileSize(this.usage.size);
    }.property(),

    iconClass: function() {
        var nameSplit = this.get('usage').key.split('.');
        return formatFileIcons(nameSplit[nameSplit.length - 1]);
    }.property('usage'),

    popIcon: function() {
        return "pop_icon";
    }.property(),

    defaultMargin: function() {
        return "margin_15";
    }.property(),

    willDestroyElement() {
      this.set('selectedItem', null);
    },

    propertyIcon: function() {
      this.setPropertyIcon();
      if(this.get('selectedIcon')) {
        return "properties-icon-selected";
      } else {
        return "properties-icon-unselected";
      }
    }.property('selectedIcon'),

    @observes('selectedItem')
    selectIcon() {
      if(this.get('selectedItem') != null) {
        this.setPropertyIcon();
      }
    },

    setPropertyIcon: function() {
      if(this.get('selectedItem')) {
        if(this.get('selectedItem') === this.get('name')) {
          this.set('selectedIcon', true);
        } else {
          this.set('selectedIcon', false);
        }
      }
    },

    actions: {

        currentObject() {
          this.set('selectedItem', this.get('name'));
        },

        destroy() {
            showModal('storageBucketObjectDestroy', {
                title: 'bucket.destroy_file',
                smallTitle: true,
                titleCentered: true,
                model: this.get('model')
            }).setProperties({bucketName: this.get('bucket_name'), key: this.get('usage').key});
        }
    }

});
