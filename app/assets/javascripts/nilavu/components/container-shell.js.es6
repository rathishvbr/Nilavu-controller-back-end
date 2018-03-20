import Ember from 'ember';
import {Terminal} from 'nilavu/lib/xterm';

export default Ember.Component.extend({
  instance: null,
  command: null,
  cols: 80,
  rows: 24,
  showProtip: true,

  status: 'connecting',
  error: null,
  socket: null,
  term: null,

  asmsid: Em.computed.alias('model.asmsid'),
  amsid: Em.computed.alias('model.id'),
  account_id: Em.computed.alias('model.topicTrackingState.currentUser.email'),

  didInsertElement: function() {
    this._super();
    this.connect();
  },

  connect: function() {
    var url = Nilavu.ShellServer + "/shell/" + this.get('account_id') + "/" + this.get('asmsid') + "/" + this.get('amsid') ;
    var socket = new WebSocket(url);
    this.set('socket', socket);

    socket.onopen = () => {
      this.set('status','initializing');

      var term = new Terminal({
        cols: this.get('cols'),
        rows: this.get('rows'),
        useStyle: true,
        screenKeys: true,
        cursorBlink: false
      });
      this.set('term', term);

      term.on('data', function(data) {
        //console.log('To Server:',data);
        //socket.send(btoa(unescape(encodeURIComponent(data))));// jshint ignore:line
        socket.send(data);
      });

      term.open(this.$('.shell-body')[0]);

      socket.onmessage = (message) => {
        this.set('status','connected');
        this.sendAction('connected');
        //console.log('From Server:',message.data);
        //term.write(decodeURIComponent(escape(new Blob([message.data], {type:'text/html'}))));// jshint ignore:line
        term.write(message.data);
      };

      socket.onclose = () => {
        try {
          this.set('status','closed');
          term.destroy();
          if ( !this.get('userClosed') )
          {
            this.sendAction('dismiss');
          }
        } catch (e) {
        }
      };
    };
  },

  disconnect: function() {
    this.set('status','closed');
    this.set('userClosed',true);

    var term = this.get('term');
    if (term)
    {
      term.destroy();
      this.set('term', null);
    }

    var socket = this.get('socket');
    if (socket)
    {
      socket.close();
      this.set('socket', null);
    }

    this.sendAction('disconnected');
  },

  willDestroyElement: function() {
    this.disconnect();
    this._super();
  }
});
