export default Ember.Controller.extend({
    queryParams: [
        'lineage', 'name', 'id'
    ],
    host: null,
    port: null,
    name: null,

    vncname: function() {
        return "VNC viewer  " + this.get('name');
    }.property('name'),  

    actions: {
        close() {
            window.close();
        }
    }

});
