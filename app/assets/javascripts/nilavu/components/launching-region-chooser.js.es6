export default Ember.Component.extend({
    tagName: 'label',
    classNameBindings: [
        ':btn', ':btn-block', 'isActive:active'
    ],

    chooserName: 'select',
    value: 'Not Available',

    regionableName: Ember.computed.alias('name'),

    isActive: function() {
        const region = this.get('regionable') || "";
        let isActiveVar = region.trim().length > 0 && region.trim() === this.get('regionableName');
        if (isActiveVar === true) {
            $("#component-create").animate({
                scrollTop: $("#component-create").height() + 500
            }, 1000);
            this.set('chooserName', 'selected');
        }
        else {
          this.set('chooserName', 'select');
        }
        return isActiveVar;
    }.property("regionable"),

    myStyle: Ember.computed('display', function() {
        return Ember.String.htmlSafe("display:none");
    })
});
