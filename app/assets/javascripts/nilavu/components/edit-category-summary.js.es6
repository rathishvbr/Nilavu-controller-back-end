import {buildCategoryPanel} from 'nilavu/components/edit-category-panel';
import SSHOptionType from 'nilavu/models/sshoption-type';
import Networks from 'nilavu/models/networks';

export default buildCategoryPanel('summary', {
    editingPermissions: false,
    selectedGroup: null,
    selectedPermission: null,

    networks: function() {
        return Networks.available(this.get("category.regions"), this.get('category.regionoption'));
    }.property('category.regions', 'category.regionoption'),

    sshoptions: function() {
        return Em.A([
            {
                group_name: "root_pwd",
                op: SSHOptionType.create({id: 1})
            }, {
                group_name: "create",
                op: SSHOptionType.create({id: 2})
            }, {
                group_name: "old",
                op: SSHOptionType.create({id: 3})
            }
        ]);
    }.property(),

    sshFrequencies: function() {
        var rval = [];
        _.each(this.get("sshoptions"), function(p) {
            rval.addObject({name: p.op.description(), value: p.op.id});
        });
        return rval;
    }.property("sshoptions"),

    duplicateChanged: function() {
        this.set('category.duplicateoption', this.get('duplicateOption'));
    }.observes('duplicateOption'),

    duplicateOption: function() {
        if (this.get('category.duplicateoption')) {
            return this.get('category.duplicateoption');
        }
        return 1;
    }.property('category.regions', 'category.resourceoption'),

    keypairsChanged: function() {      
        this.set('category.keypairoption', this.get('keypairOption'));
        this.set('category.keypairnameoption', this.get('keypairNameOption'));
    }.observes('keypairOption', 'keypairNameOption')

});
