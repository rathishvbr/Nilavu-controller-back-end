export default Ember.Component.extend({

    repoChanged: function() {
        if (!this.get('selectedRepo')) {
          this.set('category.versionoption', "");
            return;
        }

        if (!this.get('category.customappname')) {
          this.set('category.versionoption', "");
            return;
        }

        this.set('category.versionoption', this.get('category.customappname'));
    }.observes('selectedRepo'),

    myRepos: I18n.t('customapp.your_repos'),

    publicRepos: I18n.t('customapp.public_repos'),

    myGithub: function() {
        const g = (this.get('customRepoType') === this.myRepos);
        this.set('gitty', g);
    }.observes('customRepoType'),

    myPublicRepo: function() {
        this.set('category.versionoption', this.get('category.customappname'));
        const p = (this.get('customRepoType') === this.publicRepos);
        this.set('pubty', p);
    }.observes('customRepoType')

});
