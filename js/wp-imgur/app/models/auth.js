import Ember from 'ember';
import api from 'wp-imgur/ext/arrow_api';
import config from 'wp-imgur/config';

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

    this.set('authorized', config.get('authorized'));
    this.set('authorizeUrl', config.get('authorizeUrl'));
    this.set('pin', '');

    return this;
  },

  verifyPin: function() {
    var self   = this;
    var params = {
      type: 'POST',
      data: {
        'pin': this.get('pin')
      }
    };

    return api.request('auth', 'verifyPin', params)
    .then(function(json) {
      self.set('authorized', true);
      return true;
    });
  }
});

export default AuthModel.create();
