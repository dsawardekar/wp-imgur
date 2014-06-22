import Ember from 'ember';
import api from 'wp-imgur/ext/arrow_api';

var AuthModel = Ember.Object.extend({
  authorized: false,
  authorizeUrl: null,
  pin: null,

  loaded: function() {
    return this.get('authorizeUrl') !== null;
  }.property('authorizeUrl'),

  load: function() {
    if (this.get('loaded')) {
      return this;
    }

    var self   = this;
    var params = { 'type': 'GET' };

    return api.request('auth', 'index', params)
    .then(function(json) {
      self.set('authorized', json.authorized);
      self.set('authorizeUrl', json.authorizeUrl);
      self.set('pin', '');

      return self;
    });
  },

  verifyPin: function() {
    var data   = { 'pin': this.get('pin') };
    var params = {
      type: 'POST',
      data: JSON.stringify(data)
    };

    return api.request('auth', 'verifyPin', params)
    .then(function(json) {
      return true;
    });
  }
});

var instance = AuthModel.create();

export default instance;
