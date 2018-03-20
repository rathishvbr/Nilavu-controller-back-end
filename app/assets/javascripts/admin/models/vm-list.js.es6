import RestModel from 'nilavu/models/rest';
const VmList = RestModel.extend({

    list() {
        return Nilavu.ajax("admin/vmlist/all", {type: 'GET'});
    }
});

export default VmList;
