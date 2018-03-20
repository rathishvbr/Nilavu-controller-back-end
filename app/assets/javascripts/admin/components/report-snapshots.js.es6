export default Ember.Component.extend({
    tagName: 'div',
    reverseColors: Ember.computed.match('report.type', /^(time_to_first_response|topics_with_no_response)$/),
    classNameBindings: ['reverseColors'],
    sortProperties: ['name'],
    reportSnapshot: Ember.computed.sort('rowvalues', 'sortProperties'),
    reverseSort: false,

    showWhenEmpty: function() {
        return (this.get("rowvalues") == undefined || this.get("rowvalues").length == 0)
            ? true
            : false;
    }.property("model"),

    actions: {

        refreshAfterDelete() {
            this.sendAction('refreshReportAction');
        },

        sortBy: function(property) {
         this.toggleProperty('reverseSort');
         let sortOrder = this.get('reverseSort')
             ? 'desc'
             : 'asc';
            this.set("sortProperties", [property+":"+sortOrder]);
        }
    }

});
