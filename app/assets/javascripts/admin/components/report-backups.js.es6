import Ember from 'ember';
import showModal from 'nilavu/lib/show-modal';
export default Ember.Component.extend({
    tagName: 'div',
    isClicked: false,
    reverseColors: Ember.computed.match('report.type', /^(time_to_first_response|topics_with_no_response)$/),
    classNameBindings: ['reverseColors'],
    sortProperties: ['name'],
    reportBackups: Ember.computed.sort('rowvalues', 'sortProperties'),
    reverseSort: false,
    account_id: Ember.computed.alias('currentUser.email'),
     takebackupspinner:false,

    showWhenEmpty: function() {
        return (this.get("rowvalues") == undefined || this.get("rowvalues").length == 0)
            ? true
            : false;
    }.property("model"),

    actions: {

        refreshAfterDelete() {
            this.sendAction('refreshReportAction');
        },

}


});
