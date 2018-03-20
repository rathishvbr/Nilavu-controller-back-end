import RestModel from 'nilavu/models/rest';
const Marketplace = RestModel.extend({
    reload() {
        const self = this;
        return Nilavu.ajax('/marketplaces/activity/' + this.get('id'), {type: 'GET'}).then(function(marketplaces_json) {
            self.updateFromJson(marketplaces_json);
        });
    },

    load() {
        const self = this;
        return Nilavu.ajax('/marketplaces/activity/', {type: 'GET'}).then(function(marketplaces_json) {
            self.updateFromJson(marketplaces_json);
        });
    },

    postStream: function() {
        return this.store.createRecord('postStream', {id: this.get('id')});
    }.property(),

    updateFromJson(json) {
        const self = this;
        self.set('details', json);

        const keys = Object.keys(json);

        keys.forEach(key => {
            self.set(key, json[key]);
        });
    }
});

Marketplace.reopenClass({});

export default Marketplace;
