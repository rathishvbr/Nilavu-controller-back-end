import FilterProperties from 'nilavu/models/filter-properties';
export default Ember.Controller.extend({
    queryParams: [
        'name', 'id', 'type'
    ],
    host: null,
    port: null,
    name: null,
    sendCtrlAltDel: false,

    vncname: function() {
        return "VNC viewer  " + this.get('name');
    }.property('name'),

    hideURL: function() {
        history.replaceState({}, 'lineaged', '/vnc');
    }.observes('lineaged', 'host'),

    vncport: function() {
        const port = FilterProperties.byKey(this.get('model.outputs'), "vncport");

        if (port == null || Ember.isEmpty(port)) {
            return this.notificationMessages.error(I18n.t('vm_management.vnc_host_port_empty'));
        }
        return port;
    }.property('model.outputs'),

    vnchost: function() {
        const host = FilterProperties.byKey(this.get('model.outputs'), "vnchost");

        if (host == null || Ember.isEmpty(host)) {
            return this.notificationMessages.error(I18n.t('vm_management.vnc_host_port_empty'));
        }
        return host;
    }.property('model.outputs'),

    actions: {
        close() {
            window.close();
        },
        ctrlAltDel() {
            this.toggleProperty('sendCtrlAltDel');
        }
    }

});
