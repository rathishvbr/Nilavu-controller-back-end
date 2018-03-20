import { registerUnbound } from 'nilavu-common/lib/helpers';

registerUnbound('cook-text', function(text) {
  return new Handlebars.SafeString(Nilavu.Markdown.cook(text, {sanitize: true}));
});

