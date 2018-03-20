import debounce from 'nilavu/lib/debounce';

export default Ember.Component.extend({
    tagName: 'tr',
    name: Ember.computed.alias('network.name'),
    disable: Ember.computed.not('network.enabled'),
    title: Ember.computed.alias('network.title'),

    content_title: function() {
        return I18n.t(this.get('title'));
    }.property(),

    enablesubNetIpsCounter: function() {
        if (this.get('checkedSubNet')) {
            return false;
        } else {
            this.set('subNetIpsCount', "");
            return true;
        }
    }.property('checkedSubNet'),

    wantSubNetIps() {
        var data = {
            key: this.get('name'),
            value: this.get('subNetIpsCount')
        };
        return this.set('model.network.' + this.get('name'), data);
    },

    countChanegd: function() {
        this.wantSubNetIps();
    }.observes('subNetIpsCount'),

    actions: {
        subNetChanged: debounce(function(title) {
            if (Em.isEmpty(title)) {
                this.wantSubNetIps();
                return;
            }
        }, 300)
    }
});
