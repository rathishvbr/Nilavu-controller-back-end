import {observes} from 'ember-addons/ember-computed-decorators';
import FilterProperties from 'nilavu/models/filter-properties';

export default Ember.Component.extend({
    name: null,
    enableDisableVNC: "btn-vertice btn btn-default disableVNCButton",

    @observes('activateVNC')request() {
        this.set('name', this.get("model.details.name"));
        const self = this;
        this.get('model').reload().then(function() {
            const host = FilterProperties.byKey(self.get('model.outputs'), "vnchost"),
                port = FilterProperties.byKey(self.get('model.outputs'), "vncport");

            if (host === undefined || host === "" || port === "" || port === undefined && this.get('activateVNC')) {
                self.set("enableDisableVNC", "btn-vertice btn btn-default disableVNCButton");
                self.notificationMessages.error(I18n.t('vm_management.vnc_host_port_empty'));
            } else {
                self.set("enableDisableVNC", "btn-vertice btn btn-success");
            }
        }).catch(function() {
            self.notificationMessages.error(I18n.t('vm_management.error'));
        });
    }
});
