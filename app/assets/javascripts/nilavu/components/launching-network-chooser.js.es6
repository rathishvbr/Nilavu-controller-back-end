import debounce from 'nilavu/lib/debounce';

export default Ember.Component.extend({
    name: Ember.computed.alias('network.name'),
    disable: Ember.computed.not('network.enabled'),
    title: Ember.computed.alias('network.title'),

    content_title: function() {
        return I18n.t(this.get('title'));
    }.property(),

    wantSubNetIps() {
        var data = {
            key: this.get('name'),
            value: this.get('checkedSubNet')
        };
        this.set('category.networks', this.get('checkedSubNet'));
        return this.set('category.' + this.get('name'), data);
    },

    actions: {
        subNetChanged: debounce(function(title) {
            if (Em.isEmpty(title)) {
                this.wantSubNetIps();
                return;
            }
        }, 300)
    }
});
