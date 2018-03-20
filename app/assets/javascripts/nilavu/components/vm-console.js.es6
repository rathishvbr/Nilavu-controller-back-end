import Ember from 'ember';

export default Ember.Component.extend({
    instance: null,

    status: 'Connecting...',
    rfb: null,
    rfbState: null,
    showProtip: true,

    actions: {
        outsideClick() {},

        cancel() {
            this.disconnect();
            this.sendAction('dismiss');
        },

        ctrlAltDelete() {
            this.get('rfb').sendCtrlAltDel();
        }
    },

    didInsertElement() {
        this._super();
        Ember.run.next(this, 'exec');
    },

    willDestroyElement() {
        this.disconnect();
        this._super();
    },

    exec() {
        this.connect();
    },

    connect() {
        //var parts = parseUri(exec.get('url'));

        var self = this;
        function updateState(rfb, state, oldstate, msg) {
            if (this.isDestroyed || this.isDestroying) {
                return;
            }

            if (typeof msg !== 'undefined') {
                self.set('status', (msg + '').replace(/ \(unencrypted\)/, ''));
            }

            self.set('rfbState', state);
        }

        var rfb = new Nilavu.NoVNC.RFB({
            target: this.$('.console-canvas')[0],
        //    encrypt: parts.protocol === 'wss',
            true_color: true,
            local_cursor: true,
            shared: true,
            view_only: false,
            onUpdateState: updateState,
            wsProtocols: ['binary']
        });

        var options = {
          host: this.get('vnchost'),
          port: this.get('vncport'),
          password: "",
          url: Nilavu.VncServer,
        };
        rfb.connect(options);

        this.set('rfb', rfb);
    },

    rfbStateChanged: function() {
        if (this.get('rfbState') === 'disconnected' && !this.get('userClosed')) {
            this.send('cancel');
        }

        if (this.get('rfbState') === 'normal') {
            var $body = this.$('.console-body');
            var width = $('CANVAS').width() + parseInt($body.css('padding-left'), 10) + parseInt($body.css('padding-right'), 10);
            $body.width(width);
        }
    }.observes('rfbState'),

    sendCtrlAltDelWatcher: function() {
            this.send('ctrlAltDelete');
    }.observes('sendCtrlAltDel'),

    disconnect() {
        this.set('status', 'Closed');
        this.set('userClosed', true);

        var rfb = this.get('rfb');
        if (rfb) {
            rfb.disconnect();
            this.set('rfb', null);
        }
    },

    ctrlAltDeleteDisabled: function() {
        return this.get('rfbState') !== 'normal';
    }.property('rfbState')
});
