import {toscaTypeParse, filterInputs} from 'nilavu/helpers/data-parser';
export default Ember.Component.extend({
    tagName: 'div',
    classNameBindings: [
        ':version_select', 'isActive:versionactive'
    ],

    backableName: Ember.computed.alias('version.id'),
    backupName: Ember.computed.alias('version.name'),
    cattype: Ember.computed.alias('version.cattype'),

    showBrandImage: function() {
      var fullBrandUrl = this.get('version.tosca_type');

        if (Em.isNone(fullBrandUrl)) {
            return `<img src="/images/brands/dummy.png" />`.htmlSafe();
        }

        const split = fullBrandUrl.split('.');

        if (split.length >= 2) {
            var brandImageUrl = split[2].trim().replace(/\s/g, '');
            return `<img src="/images/brands/${brandImageUrl}.png" />`.htmlSafe();
        }

        return `<img src="/images/brands/ubuntu.png" />`.htmlSafe();
    }.property('version'),

    isActive: function() {
        const version = this.get('category.backupName') || "";
        return version.trim().length > 0 && version.trim() === this.get('backupName');
    }.property("category.backupName"),

    refresh() {
      this.set("versionDetail.envs", []);
      this.set("versionDetail.cattype", "");
      this.set("versionDetail.inputs", []);
      this.set('category.sourceidentifier', "");
      this.set('category.versionoption', "");
      this.set('category.customappversion', "");
      this.set("category.sourceurl", "");
    },

    loadENVS() {
      if(!Ember.isEmpty(this.get("version.assembly")) && this.get('version.assembly')[0].components.length > 0){
        this.set("versionDetail.envs", (this.get('version.assembly')[0].components[0][0].envs));
       }
    },

    loadSource() {
      if(!Ember.isEmpty(this.get("version.assembly")) && this.get('version.assembly')[0].components.length > 0){
        this.set("category.sourceurl", (this.get('version.assembly')[0].components[0][0].repo.url));

      }
    },

    loadOptions() {
      if(!Ember.isEmpty(this.get("version.assembly")) && (this.get('version.assembly')[0].inputs.length > 0 )) {
      this.get("versionDetail.options").pushObject({"key":"username","value":filterInputs("app_username", this.get('version.assembly')[0].inputs)});
      this.get("versionDetail.options").pushObject({"key":"password","value":filterInputs("app_password", this.get('version.assembly')[0].inputs)});
    }
    },

    updateVersionDetail() {
      this.set("versionDetail.inputs", []);
      this.set("versionDetail.cattype", toscaTypeParse(this.get('version.tosca_type'), 1).toUpperCase());
        if(!Ember.isEmpty(this.get("version.assembly"))){
      $.merge( this.get("versionDetail.inputs"), this.get('version.assembly')[0].inputs );
      this.get("versionDetail.inputs").pushObject({"key":"os","value":toscaTypeParse(this.get('version.assembly')[0].tosca_type, 2)});
    }else{
    this.get("versionDetail.inputs").pushObject({"key":"os","value":toscaTypeParse(this.get('version.tosca_type'), 2)});
    }
    },

    updateCategoryDetails() {
      this.set('category.sourceidentifier', toscaTypeParse(this.get('version.tosca_type'), 0));
      this.set('category.versionoption', toscaTypeParse(this.get('version.tosca_type'), 2));
      this.set('category.backupName', this.get('backupName'));
      this.set('category.backup_id', this.get('backableName'));
      this.set('category.versiondetail', this.get('versionDetail'));
    if(!Ember.isEmpty(this.get("version.assembly"))){
      this.set('category.customappversion', filterInputs("version", this.get('version.assembly')[0].inputs));
      this.set('category.bitnami_username', filterInputs("bitnami_username", this.get('version.assembly')[0].inputs));
      this.set('category.bitnamiPassword', filterInputs("bitnami_password", this.get('version.assembly')[0].inputs));
      this.set('category.app_username', filterInputs("app_username", this.get('version.assembly')[0].inputs));
      this.set('category.app_password', filterInputs("app_password", this.get('version.assembly')[0].inputs));
       }
    },

    click: function() {
        this.refresh();
        this.updateVersionDetail();
        this.loadENVS();
        this.loadOptions();
        this.loadSource();
        this.updateCategoryDetails();
    }

});
