import { on, computed } from  'ember-addons/ember-computed-decorators';
import { observes} from 'ember-addons/ember-computed-decorators';
import debounce from 'nilavu/lib/debounce';

export default Ember.Component.extend({

actions:{

  changePlatform: debounce(function(title) {
        if (Em.isEmpty(title)) {
          if (this.get('enableone') === true)
          {
            this.get('category').pushObject(this.get('one'));
          }
          if (this.get('enableone') === false)
          {
            this.get('category').removeObject(this.get('one'));
          }
          this.toggleProperty('platformActivator');
          return;
        }
      }, 300),
}
});
