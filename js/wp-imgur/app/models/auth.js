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
    var data   = { 'pin': this.get('pin') };
    var params = {
      type: 'POST',
      data: JSON.stringify(data)
    };

    /*
    var self = this;
    var defer = new Ember.RSVP.Promise(function(resolve, reject) {
      setTimeout(function() {
        self.set('authorized', true);
        console.log('changed authorized to', self.get('authorized'));
        resolve(true);
      }, 1000);
    });

    return defer;
    */

    return api.request('auth', 'verifyPin', params)
    .then(function(json) {
      return true;
    });
  }
});

var instance = AuthModel.create();

export default instance;