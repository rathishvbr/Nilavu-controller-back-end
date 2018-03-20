import { registerUnbound } from 'nilavu-common/lib/helpers';

registerUnbound('i18n', (key, params) => I18n.t(key, params));
