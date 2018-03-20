import RestModel from 'nilavu/models/rest';
import Networks from 'nilavu/models/networks';

const CLOSED = 'closed',
    SAVING = 'saving',
    OPEN = 'open',

    // The actions the composer can take
    CREATE_TOPIC = 'createTopic',

    // A default hack to say the user can launch.
    IAM_KING = 1,

    ONECLICK = "oneclick",

    OS = "os",

    // When creating, these fields can be serialzed

    _create_serializer = {
        random_name: 'random_name',
        domain: 'domain',
        region: 'regionoption',
        unit: 'unitoption',
        number_of_units: 'number_of_units',
        storage_hddtype: 'storage_hddtype',
        selectionoption: 'selectionoption',
        keypairoption: 'keypairoption',
        keypairname: 'keypairname',
        enable_ipv6: 'enable_ipv6',
        enable_privnetwork: 'enable_privnetwork'
    };

const Composer = RestModel.extend({
    creatingTopic: Em.computed.equal('action', CREATE_TOPIC),

    viewOpen: Em.computed.equal('composeState', OPEN),

    composeStateChanged: function() {
        var oldOpen = this.get('composerOpened');

        if (this.get('composeState') === OPEN) {
            this.set('composerOpened', oldOpen || new Date());
        } else {
            if (oldOpen) {
                var oldTotal = this.get('composerTotalOpened') || 0;
                this.set('composerTotalOpened', oldTotal + (new Date() - oldOpen));
            }
            this.set('composerOpened', null);
        }
    }.observes('composeState'),

    justName: function() {
        var split = this.get('metaData.versionoption').split('_');
        if (split.length > 1) {
            return split[0];
        }
        return this.get('metaData.versionoption');
    }.property('metaData.versionoption'),

    justVersion: function() {
        var split = this.get('metaData.versionoption').split('_');
        if (split.length > 1) {
            return split[1];
        }

        if (this.get('metaData.customappversion')) {
            return this.get('metaData.customappversion');
        }

        return "";
    }.property('metaData.versionoption'),

    osName: function() {
        if (this.get('metaData.versiondetail.inputs') && this.get('metaData.versiondetail.inputs').length > 0) {
            return this.get('metaData.versiondetail.inputs').filterBy('key', OS)[0].value;
        }
        return "";
    }.property('metaData.versiondetail'),

    //cattype
    categoryType: Ember.computed.alias('metaData.versiondetail.cattype'),
    provider: Ember.computed.alias('metaData.versiondetail.provider'),
    quotaIds: Ember.computed.alias('metaData.unitoption.quota_ids'),

    oneClick: function() {
        if (this.get('metaData.versiondetail') && this.get('options').length > 0) {
            const opts = this.get('options');
            if (opts && opts.length > 0) {
                return this._filterOutputs(ONECLICK);
                //return (opts.filter((f) => f.key === ONECLICK ? f.value : false));
            }
        }
        return false;
    }.property('metaData.versiondetail'),

    _filterOutputs(key) {
        if (this.get('options').length > 0) {
            const optpairs = this.get('options').filterBy('key', key);
            if (optpairs.length > 0) {
                return optpairs[0].key === key
                    ? optpairs[0].value
                    : "";
            }
        }
        return "";
    },

    hasQuotas: function() {
        return (this.get('quotaIds') != null && this.get('quotaIds').length > 0);
    }.property('quotaIds'),

    networks: function() {
        return Networks.available(this.get("metaData.regions"), this.get('metaData.regionoption'));
    }.property('metaData.regions', 'metaData.regionoption'),

    subNetworks: function() {
        const self = this;
        var network = Networks.enabled(this.get('networks')).reduce(function(a, b) {
            const s = self.get('metaData.' + b.name);
            if (s) {
                return a.concat({key: s.key, value: s.value});
            }
            return a;
        }, []);
        return network;
    }.property('metaData.network', 'networks'),

    hddorSSDCostPerHour: function() {
        if (this.get('metaData.unitoption.hdd_cost_per_hour') > 0) {
            return this.get('metaData.unitoption.hdd_cost_per_hour');
        } else {
            return this.get('metaData.unitoption.ssd_cost_per_hour');
        }
        return '0';
    }.property('metaData.unitoption.hdd_cost_per_hour', 'metaData.unitoption.ssd_cost_per_hour'),

    quotaIdsFlattened: function() {
        const quota_ids = this.get('metaData.unitoption.quota_ids');
        const no_of_units = this.get('metaData.number_of_units');

        let quota_id_flat = "";

        if (this.get('hasQuotas')) {
            quota_id_flat = quota_ids.slice(0, no_of_units).join(',');
        }
        return quota_id_flat;
    }.property('metaData.unitoption.quota_ids'),

    options: Ember.computed.alias('metaData.versiondetail.options'),

    enviRonment: Ember.computed.alias('metaData.versiondetail.envs'),

    //We consider it as a source having a changeset(branch) if it has following filters
    // 1. sourceName = [github, gitlab]
    // 2. sourceURL  = [github.com/megamsys/abcd.git]
    // 3. oneClick = false, hence we get rid of bitnami's, dockerhub images.
    sourceOrImage: function() {
        if (this.get('sourceName') && this.get('sourceURL') && !this.get('oneClick')) {
            return 'source';
        }
        return 'image';
    }.property('sourceName', 'sourceURL'),

    sourceName: Ember.computed.alias('metaData.sourceidentifier'),
    sourceURL: Ember.computed.alias('metaData.sourceurl'),
    sourceToken: Ember.computed.alias('metaData.sourceauthtoken'),
    sourceOwner: Ember.computed.alias('metaData.sourceowner'),
    sourceBranch: Ember.computed.alias('metaData.sourceChangeSet'),
    sourceTag: Ember.computed.alias('metaData.sourceChangeSetTag'),

    // Determine if the kitty is available for the user.
    missingBalanceInKitty: function() {
        // const balances = this.get('balances');
        //have a site setting allow_if_nobalance

        return IAM_KING > 0; //so who is the queen ? :)
    }.property('balances'),

    // whether to submit the topic if there is balance or not
    cantSubmitTopic: function() {

        // can't submit while loading
        if (this.get('loading'))
            return true;

        // reply is always required
        if (!this.get('missingBalanceInKitty'))
            return true;

        return false;
    }.property('loading', 'missingBalanceInKitty'),

    hasMetaData: function() {
        const metaData = this.get('metaData');
        return metaData
            ? Em.isEmpty(Em.keys(this.get('metaData')))
            : false;
    }.property('metaData'),

    /**
      Did the user make changes to the launcher?

      @property launcherDirty
    **/
    launcherDirty: function() {
        return this.get('launcher') !== this.get('originalText');
    }.property('launcher', 'originalText'),

    _setupComposer: function() {
        this.setProperties({itemsLoaded: 0, content: []});
    }.on('init'),

    //     Open a composer and initialize its metaData
    open(opts) {

        if (!opts)
            opts = {};
        this.set('loading', false);

        this.setProperties({
            composeState: opts.composerState || OPEN,
            action: opts.action
        });

        this.setProperties({
            metaData: opts.metaData
                ? Em.Object.create(opts.metaData)
                : null
        });

        return false;
    },

    save() {
        if (!this.get('cantSubmitTopic')) {
            return this.createTopic();
        }
    },

    /**
      Clear any state we have in preparation for a new composition.

      @method clearState
    **/
    clearState() {
        this.setProperties({
            random_name: '',
            metaData: {
                launchoption: '',
                domain: '',
                regionoption: '',
                resourceoption: '',
                unitoption: '',
                number_of_units: 1,
                storage_hddtype: '',
                selectionoption: '',
                keypairoption: '',
                keypairname: '',
                enable_publicipv4: false,
                enable_privateipv4: true,
                enable_publicipv6: false,
                enable_privateipv6: false
            }
        });
    },

    serialize(serializer, dest) {
        dest = dest || {};
        Object.keys(serializer).forEach(f => {
            const val = this.get(serializer[f]);
            if (typeof val !== 'undefined') {
                Ember.set(dest, f, val);
            }
        });
        return dest;
    },

    /* Create a new topic. What the heck is a topic ?
     Lets just pay tribute to discourse friends.
    ╔══════════════════╦════════╦═══════════════╦══════════╦══════════════════════════════════════════════╗
    ║                  ║ type   ║ source        ║ oneclick ║ url                                          ║
    ╠══════════════════╬════════╬═══════════════╬══════════╬══════════════════════════════════════════════╣
    ║ Machine          ║        ║               ║          ║                                              ║
    ║ Vertice oneclick ║ image  ║ vertice       ║ yes      ║ image(eg:redmine)                            ║
    ║ Bitnami          ║ image  ║ bitnami       ║ yes      ║ image(eg:mautic)                             ║
    ║ App(git)         ║ source ║ github/gitlab ║ no       ║ https://github.com/verticeapps/discourse.git ║
    ║ App(public)      ║ source ║ github        ║ no       ║ https://github.com/verticeapps/redmine.git   ║
    ║ Docker(git)      ║ source ║ github        ║ no       ║ https://github/verticeapps/redmine.git       ║
    ║ Docker(image)    ║ image  ║ repository    ║ no       ║ https://hub.docker.com                       ║
    ╚══════════════════╩════════╩═══════════════╩══════════╩══════════════════════════════════════════════╝
    */
    createTopic() {
        const composer = this.metaData;
        this.get('subNetworks');
        composer.set('composeState', SAVING);

        var url = "/launchers.json";

        if (this.get('id')) {
            url = 'launchers/' + this.get('id') + ".json";
        }

        var data = {
            mkp_name: this.get('justName'),
            os_name: this.get('osName'),
            version: this.get('justVersion'),
            cattype: this.get('categoryType'),
            assemblyname: composer.get('subdomain'),
            domain: composer.get('domain'),
            keypairoption: composer.get('keypairoption'),
            keypairname: composer.get('keypairnameoption'),
            region: composer.get('regionoption'),
            resource: composer.get('resourceoption'),
            number_of_units: composer.get('number_of_units'),
            flavor_id: composer.get('unitoption.flavor.id'),
            quota_ids: this.get('quotaIdsFlattened'),
            storage_hddtype: composer.get('storageoption'),
            options: JSON.stringify(this.get('options')),
            envs: JSON.stringify(this.get('enviRonment')),
            networkSettings: JSON.stringify(this.get('subNetworks')),
            oneclick: this.get('oneClick'),
            root_username: 'root',
            bitnami_username: composer.get('bitnami_username'),
            bitnami_password: composer.get('bitnamiPassword'),
        };

        //optionals
        if (this.get('sourceOrImage')) {
            data['type'] = this.get('sourceOrImage');
        };
        if(Nilavu.SiteSettings.launch_patternname){
          data['user_launch_patternname'] = Nilavu.SiteSettings.launch_patternname;
        }
        if (this.get('sourceName')) {
            data['scm_name'] = this.get('sourceName');
        };

        if (this.get('sourceURL')) {
            data['source'] = this.get('sourceURL');
        };
        if (this.get('sourceToken')) {
            data['scmtoken'] = this.get('sourceToken');
        };
        if (this.get('sourceOwner')) {
            data['scmowner'] = this.get('sourceOwner');
        };
        if (this.get('sourceBranch')) {
            data['scmbranch'] = this.get('sourceBranch');
        };
        if (this.get('sourceTag')) {
            data['scmtag'] = this.get('sourceTag');
        };
        if(composer.get('backupName') && this.get('metaData.versiondetail.backup'))
        {
          data['backup_name'] = composer.get('backupName');
          data['backup_id'] = composer.get('backup_id');
          data['backup'] = this.get('metaData.versiondetail.backup');
        };
        if(this._filterOutputs('username') && this._filterOutputs('password'))
        {
          data['app_username'] = this._filterOutputs('username');
          data['app_password'] = this._filterOutputs('password');
        };
        return Nilavu.ajax(url, {
            data: data,
            type: this.get('id')
                ? 'PUT'
                : 'POST'
        });

    }

});

Composer.reopenClass({

    // TODO: Replace with injection
    create(args) {
        args = args || {};
        args.user = args.user || Nilavu.User.current();
        args.site = args.site || Nilavu.Site.current();
        args.siteSettings = args.siteSettings || Nilavu.SiteSettings;
        return this._super(args);
    },

    serializedFieldsForCreate() {
        return Object.keys(_create_serializer);
    },

    // The status the compose view can have
    CLOSED,
    SAVING,
    OPEN,

    // The actions the composer can take
    CREATE_TOPIC
});

export default Composer;
