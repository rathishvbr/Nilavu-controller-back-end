import BufferedContent from 'nilavu/mixins/buffered-content';
import Networks from 'nilavu/models/networks';
import FilterProperties from 'nilavu/models/filter-properties';

export default Ember.Controller.extend(BufferedContent, {
    needs: [
        'application', 'modal'
    ],
    privateKey_suffix: ".key",
    spinnerprivateIn: false,
    spinnerpublicIn: false,
    privatekeyType: "PRIVATEKEY",
    privatekey: 'application/x-pem-key',

    sortNetworks: function() {
        return Networks.aggregate(this.get('model.outputs'));
    }.property('model.outputs'),

    showBrandImage: function() {
      const  fullBrandUrl = this.get('componentData.tosca_type');
        if (Em.isNone(fullBrandUrl)) {
            return `<img src="/images/brands/dummy.png" />`.htmlSafe();
        }

        const split = fullBrandUrl.split('.');

        if (split.length >= 2) {
            var brandImageUrl = split[2].trim().replace(/\s/g, '');
            return `<img src="/images/brands/${brandImageUrl}.png" />`.htmlSafe();
        }

        return `<img src="/images/brands/ubuntu.png" />`.htmlSafe();
    }.property('model.tosca_type'),

    source: function() {
        return this.get('componentData.repo.source');
    }.property('componentData'),

    title: Ember.computed.alias('fullName'),

    fullName: function() {
        return this.get('model.name');
    }.property('model.name'),

    application: function() {
        return this.get('componentData.tosca_type').split('.')[2].capitalize();
    }.property('componentData'),

    publisher: function() {
        return this.get('componentData.tosca_type').split('.')[0];
    }.property('componentData'),

    appCategory: function() {
        return this.get('componentData.tosca_type').split('.')[1];
    }.property('componentData'),

    domain: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"domain");
    }.property('model.inputs'),

    sshKey: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"sshkey");
    }.property('model.inputs'),

    rootUserName: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"root_username");
    }.property('model.inputs'),

    byRootUserName: function() {
        if (!Em.isEmpty(this.get("rootUserName"))) {
            return true;
        }
        return false;
    }.property('rootUserName'),

    bitnamiPwd: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"bitnami_password");
    }.property('model.inputs'),

    appPwd: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"app_password");
    }.property('model.inputs'),

    appUsername: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"app_username");
    }.property('model.inputs'),

    bitnamiUser: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"bitnami_username");
    }.property('model.inputs'),

    enableBitnami: function() {
        return (Em.isEqual(this.get('publisher'), this.constants.BITNAMI)) && (Em.isEqual(this.get('appCategory'), this.constants.COLLABORATIONAPP))
            ? true
            : false;
    }.property('publisher', 'appCategory'),

    enableprepackagedApp: function() {
        return (Em.isEqual(this.get('publisher'), this.constants.VERTICE)) && ((Em.isEqual(this.get('appCategory'), this.constants.APPSERVICE)) || (Em.isEqual(this.get('appCategory'), this.constants.APPS)) || (Em.isEqual(this.get('appCategory'), this.constants.COLLABORATIONAPP))) && !Em.isEmpty(FilterProperties.byKey(this.get('model.inputs'),"app_username"))
            ? true
            : false;
    }.property('publisher', 'appCategory'),

    cpu_cores: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"cpu");
    }.property('model.inputs'),

    ram: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"ram");
    }.property('model.inputs'),

    componentData: function() {
        return this.get('model.components')[0][0];
    }.property('model.components'),

    createdAt: function() {
        return new Date(this.get('model.created_at'));
    }.property('model.created_at'),

    status: function() {
        return this.get('model.state');
    }.property('model.state'),

    privateKey: function() {
        return FilterProperties.byKey(this.get('model.inputs'),"sshkey");
    }.property('model.inputs'),

    showPrivateSpinner: function() {
        return this.get('spinnerprivateIn');
    }.property('spinnerprivateIn'),

    showPublicSpinner: function() {
        return this.get('spinnerpublicIn');
    }.property('spinnerpublicIn'),

    _getSuffix(type) {
        if (type === this.get('privatekeyType')) {
            return this.get('privateKey_suffix');
        } else {
            return this.get('publicKey_suffix');
        }
    },

    _getKey(name) {
        return Nilavu.ajax("/ssh_keys/" + name + ".json", {type: 'GET'});
    },

    actions: {

        download(key, type) {
            var self = this;
            this.set('spinner' + key + 'In', true);
            return self._getKey(key).then(function(result) {
                self.set('spinner' + key + 'In', false);
                if (!result.failed) {
                    var blob = null;
                    if (type === self.get('privatekeyType')) {
                        blob = new Blob([result.message.ssh_keys[0].privatekey], {type: self.get('privatekey')});
                    } else {
                        blob = new Blob([result.message.ssh_keys[0].publickey], {type: self.get('publickey')});
                    }
                    Nilavu.saveAs(blob, key + self._getSuffix(type));
                } else {
                    self.notificationMessages.error(result.message);
                }
            }, function() {
                self.set('spinner' + key + 'In', false);
                return self.notificationMessages.error(I18n.t("ssh_keys.download_error"));
            });
        }
    }
});
