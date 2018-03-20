export default Ember.Component.extend({
    tagName: 'div',
    classNameBindings: [
        ':tab-pane', 'isActive:active', ':backup-scroll-bar'
    ],

    backups: Ember.computed.alias('category.cooking.backups'),

    versionable: null,

    launchableName: function() {
        return this.get('name').split('-').pop();
    }.property('name'),

    formatLaunchable: function() {
      const self = this;
        if (this.get('backups') == null) {
            return;
        } else {
            const out = this.get('backups').filter(x => x.status !== 'inprogress').map(function(v) {
                      return v;
            });
            return out;
        }
    },

    filterLaunchable: function(name) {

        const out = this.get('backups').filter(function(v) {
            return (v.name.toLowerCase() === name);
        });

        return out.length > 0
            ? out.get('firstObject')
            : out;
    },

    versionChanged: function() {
        const lv = this.formatLaunchable();
        var options = [];
        options.pushObject({"key":"oneclick","value":"true"});
        //ideally we have to pull the asm_id and get the cattype from there.
        const lf = {
            cattype: 'TORPEDO',
            options: options,
            backup: 'yes'
        };
        this.set('cookingVersions', lv);
        this.set('cookingDetail', lf);
    }.observes('category.cooking'),

    //a drab name.. cooking...
    versions: function() {
        return this.get('cookingVersions');
    }.property('cookingVersions'),

    versionDetail: function() {
        return this.get('cookingDetail');
    }.property('cookingDetail'),

    isActive: function() {
        const ln = this.get('launchableName');
        this.set('category.versionoption', "");
        this.set('category.backupName', "");
        this.set('category.versiondetail', "");

        return ln.trim().length > 0 && ln.trim() === this.get('selectedTab');
    }.property('selectedTab')

});
