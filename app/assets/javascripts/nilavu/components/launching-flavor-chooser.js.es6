export default Ember.Component.extend({
    tagName: 'label',
    classNameBindings: [
        ':btn', ':btn-block', 'isActive:active'
    ],

    chooserName: 'select',

    flavorName: Ember.computed.alias('name'),

    isActive: function() {
        const flavor = this.get('flavourable') || "";
        let isActiveVar = flavor.trim().length > 0 && flavor.trim() === this.get('flavorName');
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
    }.property('flavourable'),


    myStyle: Ember.computed('display', function() {
        return Ember.String.htmlSafe("display:none");
    })
});
