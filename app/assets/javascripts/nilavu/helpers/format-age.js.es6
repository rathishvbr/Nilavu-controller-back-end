import { autoUpdatingRelativeAge } from 'nilavu/lib/formatter';
import { registerUnbound } from 'nilavu-common/lib/helpers';

registerUnbound('format-age', function(dt) {
  const tt = new Date(dt);
  return new Handlebars.SafeString(autoUpdatingRelativeAge(tt));
});
