const Flavors = Ember.Object.extend({});
Flavors.reopenClass({

    reload(id) {
        return Nilavu.ajax('/flavors/' + id, {type: 'GET'}).then(function(result) {
            return result.message.flavors_data[0];
        });
    }
});

export default Flavors;
