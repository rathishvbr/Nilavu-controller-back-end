import { createWidget } from 'nilavu/widgets/widget';
import { h } from 'virtual-dom';

createWidget('user-menu-links', {
  tagName: 'div.logout-link',

  html() {
    const { currentUser } = this;

    const profileLink = {
      route: 'user',
      model: currentUser,
      className: 'user-profile-link profile_icon',
      icon: 'user',
      rawLabel: I18n.t('user.profile')
    };

    const links = [profileLink];

    if (currentUser.get('admin')) {

      links.push({route: 'admin',
                   icon: 'wrench',
                   rawLabel: I18n.t('admin.title'),
                   className: 'settings-link admin_wrench_icon' });
    }

    const glyphs = [];

    return h('ul.menu-links', [
             links.map(l => h('li', this.attach('link', l))),
             h('li.glyphs.disabled', glyphs.map(l => this.attach('link', $.extend(l, { hideLabel: true })))),
            ]);

  }
});

export default createWidget('user-menu', {
  tagName: 'div.user-menu',

  panelContents() {
    const path = this.currentUser.get('path');

    return [this.attach('user-menu-links', { path }),
            h('div.logout-link', [
              h('hr'),
              h('ul.menu-links',
                h('li', this.attach('link', { action: 'logout',
                                                       className: 'logout logout_icon',
                                                       icon: 'glyphicon glyphicon-off',
                                                       label: 'user.log_out',
                                                     route:'logout',
                                                 })))
              ])];
  },

  html() {
    return this.attach('menu-panel', { contents: () => this.panelContents() });
  },

  clickOutside() {
    this.sendWidgetAction('toggleUserMenu');
  }
});
