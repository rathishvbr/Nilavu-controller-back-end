import StringBuffer from 'nilavu/mixins/string-buffer';
import { iconHTML } from 'nilavu-common/helpers/fa-icon';

export default Ember.Component.extend(StringBuffer, {
  classNameBindings: [':tip', 'good', 'bad'],
  rerenderTriggers: ['validation'],

  bad: Em.computed.alias('validation.failed'),
  good: Em.computed.not('bad'),

  renderString(buffer) {
    const reason = this.get('validation.reason');
    if (reason) {
      buffer.push(iconHTML(this.get('good') ? 'ok' : 'remove') + ' ' + reason);
    }
  }
});
