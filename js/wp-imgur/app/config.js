import Ember from 'ember';

var Config = Ember.Object.extend({
  configKey: 'wp_imgur_app_run',

  store: function() {
    return window[this.get('configKey')];
  }.property(),

  apiEndpoint: function() {
    return this.get('store').apiEndpoint;
  }.property('store'),

  nonce: function() {
    return this.get('store').nonce;
  }.property('store'),

  debug: function() {
    return this.get('store').debug === '1';
  }.property('store')
});

export default Config.create();
