import {generateSignature} from 'nilavu/helpers/storage';
import {on} from 'ember-addons/ember-computed-decorators';
import { formatFileIcons, formatFileSize } from 'nilavu/helpers/file-formats';
export default Ember.Component.extend({
    tagName: 'tr',
    classNameBindings: ['working'],

    spinnerConnectIn: false,
    storageACL: 'private',
    storageAccessKeyId: null,

    objectName: null,
    objectSize: null,
    objectIcon: null,
    signingUrl: '',

    filekey: null,
    fileaccesskey: null,
    filepolicy: null,
    filesignature: null,

    uploadPercentage: 0,
    progressPosition: 0,
    maxProgressPosition: 100,
    bucket_name: Em.computed.alias('model.bucket_name'),
    access_key: Em.computed.alias('model.access_key'),
    secret_key: Em.computed.alias('model.secret_key'),
    serverAddress: Em.computed.alias('model.server'),
    https: Em.computed.alias('model.https'),
    id: Em.computed.alias('model.id'),

    @on('didInsertElement')
    _initialize() {
        $("#" + this.get('id') + "_objectfile").trigger('click');
        $("#" + this.get('id') + "_close_icon").hide();
        $("#" + this.get('id') + "_success_icon").hide();
        $("#" + this.get('id') + "_button").hide();
        $("#" + this.get('id') + "_progress_id").hide();
        this._bindUploadTarget();
    },

    streamPercentage: function() {
        return this.get('progressPosition');
    }.property('progressPosition'),

    fileObjectId: function() {
      return this.get('id') + "_objectfile";
    }.property(),

    formId: function() {
      return this.get('id') + "_form";
    }.property(),

    formDivId: function() {
      return this.get('id') + "_div_form";
    }.property(),

    progressId: function() {
      return this.get('id') + "_progress_id";
    }.property(),

    uploadStartId: function() {
      return this.get('id') + "_button";
    }.property(),

    closeIcon: function() {
      return this.get('id') + "_close_icon";
    }.property('id'),

    successIcon: function() {
      return this.get('id') + "_success_icon";
    }.property(),

    url: function() {
            return this.get('serverAddress') + this.get('bucket_name');
    }.property(),

    bucketName: function() {
        return this.get('bucket_name');
    }.property(),

    popIcon: function() {
        return "pop_icon";
    }.property(),

    showConnectSpinner: function() {
        return this.get('spinnerConnectIn');
    }.property('spinnerConnectIn'),

    percentage: function() {
        return this.get('percentVal');
    }.property('percentVal'),

    _bindUploadTarget() {
        const self = this;

        $("#" + this.get('id') + "_objectfile").change(function(e) {
            var sign = generateSignature({
                "bucketName": self.get('bucket_name'),
                "acl": self.get('storageACL'),
                "name": e.target.files[0].name,
                "contentType": e.target.files[0].type,
                "access_key": self.get('access_key'),
                "secret_access_key": self.get('secret_key')
            });
            var nameSplit = e.target.files[0].name.split('.');
            self.set('objectIcon', formatFileIcons(nameSplit[nameSplit.length - 1]));

            self.set('filekey', e.target.files[0].name);
            self.set('objectSize', formatFileSize(e.target.files[0].size));
            self.set('fileaccesskey', self.get('access_key'));
            self.set('filecontenttype', e.target.files[0].type);
            self.set('filepolicy', sign.policy);
            self.set('filesignature', sign.signature);
            //$("#" + self.get('id') + "_close_icon").show();
            $("#" + self.get('id') + "_button").show();
        });


        $("#" + this.get('id') + "_form").ajaxForm({
            beforeSend: function() {
                // var percentVal = '0%';
                $("#" + self.get('id') + "_form").hide();
                $("#" + self.get('id') + "_button").hide();
                $("#" + self.get('id') + "_div_form").hide();
                $("#" + self.get('id') + "_progress_id").show();
            },
            uploadProgress: function(event, position, total, percentComplete) {
                var percentVal = percentComplete + '%';
                self.set('progressPosition', percentVal);
                if(percentComplete == '100') {
                  $("#" + self.get('id') + "_close_icon").hide();
                  $("#" + self.get('id') + "_success_icon").show();
                  self.set('uploadProgress', false);
                }
            },
            complete: function(xhr) {
                if(xhr.status > 204) {
                  $("#" + self.get('id') + "_form").show();
                  $("#" + self.get('id') + "_button").show();
                  $("#" + self.get('id') + "_div_form").show();
                  $("#" + self.get('id') + "_success_icon").hide();
                  $("#" + self.get('id') + "_progress_id").hide();
                  self.notificationMessages.error(I18n.t('bucket.object_upload_error'));
                }
            }
        });

    }
});
