import Ember from 'ember';
import config from 'wp-imgur/config';

var ArrowApi = Ember.Object.extend({
  apiEndpoint: config.get('apiEndpoint'),
  nonce: config.get('nonce'),

  urlFor: function(controller, operation) {
    var params        = {};
    params.controller = controller;
    params.operation  = operation;
    params.nonce      = this.get('nonce');

    return this.get('apiEndpoint') + '&' + Ember.$.param(params);
  },

  request: function(controller, operation, params) {
    params.url = this.urlFor(controller, operation);

    return new Ember.RSVP.Promise(function(resolve, reject) {
      return Ember.$.ajax(params)
      .then(function(response) {
        if (response === '0') {
          reject('Not Logged In');
        } else if (response.success) {
          resolve(response.data);
        } else {
          reject(response.data.error);
        }
      })
      .fail(function(response) {
        var error;
        if (response.statusText === 'timeout') {
          error = 'Request Timed Out.';
        } else if (response.responseJSON) {
          error = response.responseJSON.data.error;
        } else {
          error = 'Unknown Response.';
        }

        reject(error);
      });
    });
  }
});

export default ArrowApi.create();
