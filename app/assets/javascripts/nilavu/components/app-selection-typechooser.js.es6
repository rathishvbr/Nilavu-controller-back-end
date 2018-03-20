export default Ember.Component.extend({
    tagName: 'label',
    classNameBindings: [':btn', ':btn-primary', ':btn-storage', 'isActive:active', 'activateContainers:allowContainers'],
    style: Ember.String.htmlSafe(''),
    attributeBindings: ['style'],

    prepackageName: Ember.computed.alias('name'),

    isActive: function() {
        const prepack = this.get('prepackageble') || "";
        return prepack.trim().length > 0 && prepack.trim() === this.get('prepackageName');
    }.property("prepackageble"),

    activateContainers: function() {
        return !this.get('allowContainers');
    }.property('allowContainers'),

    myStyle: Ember.computed('display', function() {
       return Ember.String.htmlSafe("display:none");
   })
});
