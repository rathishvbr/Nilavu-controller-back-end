import BufferedContent from 'nilavu/mixins/buffered-content';
import {spinnerHTML} from 'nilavu/helpers/loading-spinner';
import FilterProperties from 'nilavu/models/filter-properties';
import NilavuURL from 'nilavu/lib/url';
import LaunchStatus from 'nilavu/models/launch-status';

export default Ember.Controller.extend(BufferedContent, {
    needs: [
        'application', 'modal'
    ],
    progress: 10,
    selectedTab: null,
    panels: null,
    spinnerStartIn: false,
    spinnerStopIn: false,
    spinnerRebootIn: false,
    spinnerDeleteIn: false,
    spinnerRefreshIn: false,
    rerenderTriggers: ['isUploading'],
    startsubmitted: false,
    stopsubmitted: false,
    restartsubmitted: false,
    vncsubmitted: false,

    host: function() {
        return FilterProperties.byKey(this.get('topic.inputs'),"vnchost");
    }.property('topic.inputs'),

    port: function() {
        return FilterProperties.byKey(this.get('topic.inputs'),"vncport");
    }.property('topic.inputs'),

    modelType: function(){
        return this.get('model.__type');
    }.property('model.__type'),

    _initPanels: function() {
        this.set('panels', []);
        this.set('selectedTab', 'info');
    }.on('init'),

    infoSelected: function() {
        return this.selectedTab === 'info';
    }.property('selectedTab'),

    storageSelected: function() {
        return this.selectedTab === 'storage';
    }.property('selectedTab'),

    networkSelected: function() {
        return this.selectedTab === 'network';
    }.property('selectedTab'),

    cpuSelected: function() {
        return this.selectedTab === 'cpu';
    }.property('selectedTab'),

    ramSelected: function() {
        return this.selectedTab === 'ram';
    }.property('selectedTab'),

    keysSelected: function() {
        return this.selectedTab === 'keys';
    }.property('selectedTab'),

    logsSelected: function() {
        return this.selectedTab === 'logs';
    }.property('selectedTab'),

    backupSelected: function() {
        return this.selectedTab === 'backups';
    }.property('selectedTab'),

    snapshotsSelected: function() {
        return this.selectedTab === 'snapshots';
    }.property('selectedTab'),

    title: Ember.computed.alias('fullName'),

    fullName: function() {
        return this.get('model.name');
    }.property('model.name'),

    showStartSpinner: function() {
        return this.get('spinnerStartIn');
    }.property('spinnerStartIn'),

    showStopSpinner: function() {
        return this.get('spinnerStopIn');
    }.property('spinnerStopIn'),

    showRebootSpinner: function() {
        return this.get('spinnerRebootIn');
    }.property('spinnerRebootIn'),

    showDeleteSpinner: function() {
        return this.get('spinnerDeleteIn');
    }.property('spinnerDeleteIn'),

    showRefreshSpinner: function() {
        return this.get('spinnerRefreshIn');
    }.property('spinnerRefreshIn'),

    //TO-DO: WHY can we move this to LaunchStatus ?
    checkState: function() {
        const state = this.get('model.state');

        if (state) {
        let STATE = state.toUpperCase();

        if (Em.isEqual(STATE, LaunchStatus.TYPES_ACTION.SUSPEND) || Em.isEqual(STATE, LaunchStatus.TYPES_ACTION.PREERROR))
            return true;
        }
        return false;
    }.property('model.state'),

    validState: function() {
        const state = this.get('model.state') !== 'true';
        return state !== this.get('checkState')
            ? true
            : false;
    }.property('model.state', 'checkState'),


    delete() {
        var self = this;
        this.set('spinnerDeleteIn', true);
        Nilavu.ajax('/t/' + this.get('model').id + "/delete", {
            data: FilterProperties.getData(this.get('model'),'delete', 'state'),
            type: 'DELETE'
        }).then(function(result) {
            self.set('spinnerDeleteIn', false);
            if (result.success) {
                self.notificationMessages.success(I18n.t("vm_management.delete_success"));
                NilavuURL.routeTo("/");
            } else {
                self.notificationMessages.error(I18n.t("vm_management.error"));
            }
        }).catch(function() {
            self.set('spinnerDeleteIn', false);
            self.notificationMessages.error(I18n.t("vm_management.error"));
        });
    },

    stateChanged: function() {
        return this.set('currentState', this.get('model.state'));
    }.observes('model.state'),

    //TO-DO: This is redundant, we need to clean it up.
    startDisabled: function() {
      const state = this.get('currentState');

      if (state){
        let STATE = state.toUpperCase();

        if (Em.isEqual(STATE, LaunchStatus.TYPES_ERROR.POSTERROR) || !Em.isEqual(STATE, LaunchStatus.TYPES_ACTION.STOPPED))
            return true;
        }
        return false;
    }.property('startsubmitted', 'currentState'),

    stopDisabled: function() {
      const state = this.get('currentState');

      if (state){
        let STATE = state.toUpperCase();
        if (Em.isEqual(STATE, LaunchStatus.TYPES_ERROR.POSTERROR) || Em.isEqual(STATE, LaunchStatus.TYPES_ACTION.STOPPED))
            return true;
       }
        return false;
    }.property('stopsubmitted', 'currentState'),

    restartDisabled: function() {
      const state = this.get('currentState');

      if (state){
        let STATE = state.toUpperCase();
        if (Em.isEqual(STATE, LaunchStatus.TYPES_ERROR.POSTERROR))
            return true;
        }

        return false;
    }.property('restartsubmitted', 'currentState'),

    vncDisabled: function() {
        const state = this.get('currentState');

        if (state){
        let STATE = state.toUpperCase();

        if (Em.isEqual(STATE, LaunchStatus.TYPES_ERROR.POSTERROR) || Em.isEqual(STATE, LaunchStatus.TYPES_ACTION.STOPPED))
            return true;
        }

        return false;
    }.property('vncsubmitted', 'currentState'),

    actions: {
        refresh() {
            const self = this;
            self.set('spinnerRefreshIn', true);
            self.get('model').reload().then(function() {
                self.set('spinnerRefreshIn', false);
            }).catch(function() {
                self.notificationMessages.error(I18n.t("vm_management.topic_load_error"));
                self.set('spinnerRefreshIn', false);
            });
        },

        start() {
            var self = this;
            this.set('spinnerStartIn', true);
            Nilavu.ajax('/t/' + this.get('model').id + "/start", {
                data: FilterProperties.getData(this.get('model'),"start", "control"),
                type: 'POST'
            }).then(function(result) {
                self.set('spinnerStartIn', false);
                if (result.success) {
                    self.notificationMessages.success(I18n.t("vm_management.start_success"));
                } else {
                    self.notificationMessages.error(I18n.t("vm_management.error"));
                }
            }).catch(function() {
                self.set('spinnerStartIn', false);
                self.notificationMessages.error(I18n.t("vm_management.error"));
            });
        },

        stop() {
            var self = this;
            this.set('spinnerStopIn', true);
            Nilavu.ajax('/t/' + this.get('model').id + "/stop", {
                data: FilterProperties.getData(this.get('model'),"stop", "control"),
                type: 'POST'
            }).then(function(result) {
                self.set('spinnerStopIn', false);
                if (result.success) {
                    self.notificationMessages.success(I18n.t("vm_management.stop_success"));
                } else {
                    self.notificationMessages.error(I18n.t("vm_management.error"));
                }
            }).catch(function() {
                self.set('spinnerStopIn', false);
                self.notificationMessages.error(I18n.t("vm_management.error"));
            });
        },

        hardStop() {
            var self = this;
            this.set('spinnerStopIn', true);
            Nilavu.ajax('/t/' + this.get('model').id + "/stop", {
                data: FilterProperties.getData(this.get('model'),"hard-stop","control"),
                type: 'POST'
            }).then(function(result) {
                self.set('spinnerStopIn', false);
                if (result.success) {
                    self.notificationMessages.success(I18n.t("vm_management.stop_success"));
                } else {
                    self.notificationMessages.error(I18n.t("vm_management.error"));
                }
            }).catch(function() {
                self.set('spinnerStopIn', false);
                self.notificationMessages.error(I18n.t("vm_management.error"));
            });
        },

        restart() {
            var self = this;
            this.set('spinnerRebootIn', true);
            Nilavu.ajax('/t/' + this.get('model').id + "/restart", {
                data: FilterProperties.getData(this.get('model'),"restart","control"),
                type: 'POST'
            }).then(function(result) {
                self.set('spinnerRebootIn', false);
                if (result.success) {
                    self.notificationMessages.success(I18n.t("vm_management.restart_success"));
                } else {
                    self.notificationMessages.error(I18n.t("vm_management.error"));
                }
            }).catch(function() {
                self.set('spinnerRebootIn', false);
                self.notificationMessages.error(I18n.t("vm_management.error"));
            });
        },

        hardRestart() {
            var self = this;
            this.set('spinnerRebootIn', true);
            Nilavu.ajax('/t/' + this.get('model').id + "/restart", {
                data: FilterProperties.getData(this.get('model'),"hard-restart", "control"),
                type: 'POST'
            }).then(function(result) {
                self.set('spinnerRebootIn', false);
                if (result.success) {
                    self.notificationMessages.success(I18n.t("vm_management.restart_success"));
                } else {
                    self.notificationMessages.error(I18n.t("vm_management.error"));
                }
            }).catch(function() {
                self.set('spinnerRebootIn', false);
                self.notificationMessages.error(I18n.t("vm_management.error"));
            });
        },

        destroy() {
            bootbox.confirm(I18n.t("vm_management.confirm_delete")+this.get('fullName')+I18n.t("vm_management.confirm_delete_suffix"), result => {
                if (result) {
                    this.delete();
                }
            });
        }
    },

    hasError: Ember.computed.or('model.notFoundHtml', 'model.message'),

    noErrorYet: Ember.computed.not('hasError'),

    loadingHTML: function() {
        return spinnerHTML;
    }.property()

});
