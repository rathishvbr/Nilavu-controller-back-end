import RestModel from 'nilavu/models/rest';

const Ssh = RestModel.extend({
    message: null,
    errorLoading: false,

    updateFromJson(json) {
        const self = this;
        self.set('ssh', json);

        const keys = Object.keys(json);
        keys.forEach(key => {
            self.set(key, json[key]);
        });
    },

    reload() {
        const self = this;
        return Nilavu.ajax("/sshkeys", {type: 'GET'}).then(function(ssh_json) {
            self.updateFromJson(ssh_json);
        });
    }
});

export default Ssh;
