import { on } from 'ember-addons/ember-computed-decorators';
import StringBuffer from 'nilavu/mixins/string-buffer';
// import { iconHTML } from 'nilavu-common/helpers/fa-icon';
import LogsNotice from 'nilavu/services/logs-notice';

export default Ember.Component.extend(StringBuffer, {
  rerenderTriggers: ['site.isReadOnly'],

  // renderString: function(buffer) {
  //   let notices = [];
  //
  //   if (this.site.get("isReadOnly")) {
  //     notices.push([I18n.t("read_only_mode.enabled"), 'alert-read-only']);
  //   }
  //
  //   if (this.siteSettings.disable_emails) {
  //     notices.push([I18n.t("emails_are_disabled"), 'alert-emails-disabled']);
  //   }
  //
  //   if (!_.isEmpty(this.siteSettings.global_notice)) {
  //     notices.push([this.siteSettings.global_notice, 'alert-global-notice']);
  //   }
  //
  //   if (!LogsNotice.currentProp('hidden')) {
  //     notices.push([LogsNotice.currentProp('message'), 'alert-logs-notice', `<div class='close'>${iconHTML('times')}</div>`]);
  //   }
  //
  // /**
  //   TO-DO We are not ready to dispaly global notices as the css in the UI needs to tweaked.
  //   if (notices.length > 0) {
  //     buffer.push(_.map(notices, n => {
  //       var html = `<div class='row'><div class='alert alert-info ${n[1]}'>${n[0]}`;
  //       if (n[2]) html += n[2];
  //       html += '</div></div>';
  //       return html;
  //     }).join(""));
  //   } **/
  //
  // },

  @on('didInsertElement')
  _setupLogsNotice() {
    LogsNotice.current().addObserver('hidden', () => {
      this.rerenderString();
    });

    this.$().on('click.global-notice', '.alert-logs-notice .close', () => {
      LogsNotice.currentProp('text', '');
    });
  },

  @on('willDestroyElement')
  _teardownLogsNotice() {
    this.$().off('click.global-notice');
  }
});
