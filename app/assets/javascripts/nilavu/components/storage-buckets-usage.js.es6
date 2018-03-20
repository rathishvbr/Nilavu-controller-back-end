import {observes} from 'ember-addons/ember-computed-decorators';

export default Ember.Component.extend({
    spinnerUsageIn: false,
    usage: Em.computed.alias('buckets.message.spaced'),
    totalStorage: Em.computed.alias('buckets.message.spaced.buckets_size_humanized'),
    totalBuckets: Em.computed.alias('buckets.message.spaced.buckets_count'),

    _initializeSimilar: function() {
        this.set('spinnerUsageIn', true);
    }.on('init'),

    textTotalStorage: function() {
      return I18n.t("bucket.total_storage");
    }.property(),

    textTotalBuckets: function() {
      return I18n.t("bucket.total_buckets");
    }.property(),

    textLastBilledAmount: function() {
      return I18n.t("bucket.last_billed_amount");
    }.property(),

    textCreateStorage: function() {
      return I18n.t("bucket.create_storage");
    }.property(),

    textCurrentDue: function() {
      return I18n.t("bucket.current_due");
    }.property(),

    textRegion: function() {
      return I18n.t("bucket.region");
    }.property(),

    textBilling: function() {
      return I18n.t("bucket.billing");
    }.property(),

    showUsageLoading: function() {
        return this.get('spinnerUsageIn');
    }.property('spinnerUsageIn'),

    @observes('usage')listShow() {
        this.set('spinnerUsageIn', false);
    }
});
