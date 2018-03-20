import RestModel from 'nilavu/models/rest';
const AdminFlavors = RestModel.extend({});
AdminFlavors.reopenClass({
    reload() {
        return Nilavu.ajax('/admin/flavors', {type: 'GET'});
    },

    show(params) {
        return Nilavu.ajax('/admin/flavors/' + params.id, {type: 'GET'});
    }

});
export default AdminFlavors;
