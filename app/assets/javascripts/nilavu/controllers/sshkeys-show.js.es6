import showModal from 'nilavu/lib/show-modal';
export default Ember.Controller.extend({
    title: "SSH Keys",
    sshkeys: Em.computed.alias('model'),

    sortedSshKeys: Ember.computed.sort('sshkeys.message', 'sortDefinition'),
    sortBy: 'created_at', // default sort by date
    reverseSort: true, // default sort in descending order
    sortDefinition: Ember.computed('sortBy', 'reverseSort', function() {
        let sortOrder = this.get('reverseSort')
            ? 'desc'
            : 'asc';
        return [`${this.get('sortBy')}:${sortOrder}`];
    }),

    actions: {
        sshCreate() {
            showModal('sshkeyCreate', {
                title: 'ssh_keys.create',
                smallTitle: true,
                titleCentered: true,
                model: this.get('sshkeys')
            });
        },

        sshImport() {
            showModal('sshkeyImport', {
                title: 'ssh_keys.import',
                smallTitle: true,
                titleCentered: true,
                model: this.get('sshkeys')
            });
        }
    }
});
