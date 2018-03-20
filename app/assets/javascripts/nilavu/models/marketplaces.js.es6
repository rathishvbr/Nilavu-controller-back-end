import RestModel from 'nilavu/models/rest';

const Marketplaces = RestModel.extend({
    message: null,
    errorLoading: false,

    url: function() {
        let slug = this.get('slug') || '';
        if (slug.trim().length === 0) {
            slug = "topic";
        }
        return Nilavu.getURL("/t/") + (this.get('id'));
    },

    // Update our attributes from a JSON result
    updateFromJson(json) {
        const self = this;
        self.set('marketplaces', json);

        const keys = Object.keys(json);

        keys.forEach(key => { self.set(key, json[key]); });
    },


    reload() {
        const self = this;
        return Nilavu.ajax('/marketplaces', { type: 'GET' }).then(function(marketplaces_json) {
            self.updateFromJson(marketplaces_json);

        });

    },

});

Marketplaces.reopenClass({

    create() {
        const result = this._super.apply(this, arguments);
        return result;
    },


    // Load an markeplace item
    find(marketplaceId, opts) {
        let url = Nilavu.getURL("/marketplaces/") + marketplaceId;

        const data = {};
        if (opts.provider) {
            data.provider = opts.provider;
        }


        // Check the preload store. If not, load it via JSON
        return Nilavu.ajax(url + ".json", { data: data });
    }
  });

export default Marketplaces;
