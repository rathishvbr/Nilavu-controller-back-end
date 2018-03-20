import RestModel from 'nilavu/models/rest';

const Bucketfiles = RestModel.extend({
    message: null, errorLoading: false,

    // Update our attributes from a JSON result
    updateFromJson(json) {
        const self = this;
        self.set('details', json);
        const keys = Object.keys(json);
        keys.forEach(key => {
            self.set(key, json[key]);
        });
    },

    reload(bucket) {
        const self = this;
        return Nilavu.ajax('/b/' + bucket, {type: 'GET'}).then(function(bill_json) {
            self.updateFromJson(bill_json);
        });
    }
});

Bucketfiles.reopenClass({
    // Load the billing data(usage, history, regions)
    list() {
        let url = Nilavu.getURL("/bucketfiles");
        // Check the preload store. If not, load it via JSON
        return Nilavu.ajax(url + ".json", {});
    }
});

export default Bucketfiles;
