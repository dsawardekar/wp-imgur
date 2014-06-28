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

  request: function(controller, operation, queryParams) {
    queryParams.url = this.urlFor(controller, operation);

    if (queryParams.type === 'POST' && queryParams.hasOwnProperty('data')) {
      queryParams.data = JSON.stringify(queryParams.data);
    }

    return new Ember.RSVP.Promise(function(resolve, reject) {
      return Ember.$.ajax(queryParams)
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
  },

  all: function(resource) {
    var queryParams = { type: 'GET' };
    return this.request(resource, 'all', queryParams);
  },

  fetch: function(resource, params) {
    var queryParams = { type: 'GET', data: params };
    return this.request(resource, 'get', queryParams);
  },

  post: function(resource, params) {
    var queryParams = { type: 'POST', data: params };
    return this.request(resource, 'post', queryParams);
  },

  put: function(resource, params) {
    var queryParams = { type: 'POST', data: params };
    return this.request(resource, 'put', queryParams);
  },

  patch: function(resource, params) {
    var queryParams = { type: 'POST', data: params };
    return this.request(resource, 'patch', queryParams);
  },

  delete: function(resource, params) {
    var queryParams = { type: 'POST', data: params };
    return this.request(resource, 'delete', queryParams);
  }

});

export default ArrowApi.create();
