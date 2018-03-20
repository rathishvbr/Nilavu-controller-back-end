import debounce from 'nilavu/lib/debounce';
export default Ember.Component.extend({
  tagName: 'tr',

  checked: function() {
    var self = this;
    if(!Ember.isBlank(self.get('backup.labels'))){
    const matchedUsers = self.get('backup.labels').filter(function(lab) {
      return (lab.value === self.get('user.email'));
    });
    return matchedUsers.length > 0
  }
}.property('backup.labels'),

  actions: {

    changeSharedPreference: debounce(function() {
      this.set('sharingSelected', {
        'checked': this.get('checked'),
        'email': this.get('user.email')
      });
      return;

    }, 300),
  },
});
