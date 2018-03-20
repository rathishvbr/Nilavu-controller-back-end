export default Ember.Component.extend({
    tagName: 'div',
    sortProperties: ['name'],
    reportSales: Ember.computed.sort('rowvalues', 'sortProperties'),
    reverseSort: false,

    showWhenEmpty: function() {
        return (this.get("rowvalues") == undefined || this.get("rowvalues").length == 0)
            ? true
            : false;
    }.property("model"),

    actions: {
        sortBy: function(property) {
         this.toggleProperty('reverseSort');
         let sortOrder = this.get('reverseSort')
             ? 'desc'
             : 'asc';
            this.set("sortProperties", [property+":"+sortOrder]);
        }
    }

});
