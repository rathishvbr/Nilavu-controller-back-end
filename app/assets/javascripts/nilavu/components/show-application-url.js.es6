export default Ember.Component.extend({

    name: Ember.computed.alias('appUrlData.key'),
    ipAddress: Ember.computed.alias('appUrlData.value'),
    title: Ember.computed.alias('appUrlData.title'),
    hasEnvs: Em.computed.notEmpty('componentData.envs'),

    content_title: function() {
        return I18n.t(this.get('title'));
    }.property(),

    componentData: function() {
        return this.get('model.components')[0][0];
    }.property('model.components'),

    _filterEnvs(key) {
        if (this.get('hasEnvs')) {
            const out = this.get('componentData.envs').filter(function(v) {
                if (v.key.trim('.').match(key.trim('.'))) {
                    return v;
                }
            });
            return out;
        }
        return;
    },

    showApplicationUrl: function() {
        return !Ember.isEmpty(this.get('applicationUrl'));
    }.property('applicationUrl'),

    applicationUrl: function() {
      const self=this;
        const appEnvs = this._filterEnvs("port");
        if (!Em.isBlank(appEnvs)) {
            const appUrls = appEnvs.map(function(v) {
                const appEnv = v.key.split('.');
                if (appEnv && appEnv.length >= 2) {
                    return appEnv[1] + "://" + self.get('ipAddress') + ":" + v.value;
                }
                return;
            });

        if (appUrls.length) {
            const filteredAppUrls = appUrls.filter((a) => a.match('http') || a.match('https'));
            if (filteredAppUrls.length) {
                return filteredAppUrls.join("\n");
            }
        }
      }
      return "";
    }.property('ipAddress')
});
