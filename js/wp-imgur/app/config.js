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
  }.property('store'),

  authorized: function() {
    return this.get('store').authorized === '1';
  }.property('store'),

  authorizeUrl: function() {
    return this.get('store').authorizeUrl;
  }.property('store'),

  syncOnMediaUpload: function(name, value) {
    if (this._syncOnMediaUpload === undefined) {
      this._syncOnMediaUpload = this.get('store').syncOnMediaUpload === '1';
    }

    if (value !== undefined) {
      this._syncOnMediaUpload = value;
    }

    return this._syncOnMediaUpload;
  }.property('store'),

  syncOnMediaEdit: function(name, value) {
    if (this._syncOnMediaEdit === undefined) {
      this._syncOnMediaEdit = this.get('store').syncOnMediaEdit === '1';
    }

    if (value !== undefined) {
      this._syncOnMediaEdit = value;
    }

    return this._syncOnMediaEdit;
  }.property('store')

});

export default Config.create();
