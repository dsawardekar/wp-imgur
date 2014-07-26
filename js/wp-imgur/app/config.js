import Ember from 'ember';

var Config = Ember.Object.extend({
  configKey: 'wp_imgur',

  store: function() {
    return window[this.get('configKey')].options;
  }.property(),

  apiEndpoint: function() {
    return this.get('store').apiEndpoint;
  }.property('store'),

  nonce: function() {
    return this.get('store').nonce;
  }.property('store'),

  debug: function() {
    return this.get('store').debug;
  }.property('store'),

  authorized: function() {
    return this.get('store').authorized;
  }.property('store'),

  authorizeUrl: function() {
    return this.get('store').authorizeUrl;
  }.property('store'),

  album: function(name, value) {
    if (this._album === undefined) {
      this._album = this.get('store').album;
    }

    if (value !== undefined) {
      this._album = value;
    }

    return this._album;
  }.property('store'),

  syncOnMediaUpload: function(name, value) {
    if (this._syncOnMediaUpload === undefined) {
      this._syncOnMediaUpload = !!this.get('store').syncOnMediaUpload;
    }

    if (value !== undefined) {
      this._syncOnMediaUpload = value;
    }

    return this._syncOnMediaUpload;
  }.property('store'),

  syncOnMediaEdit: function(name, value) {
    if (this._syncOnMediaEdit === undefined) {
      this._syncOnMediaEdit = !!this.get('store').syncOnMediaEdit;
    }

    if (value !== undefined) {
      this._syncOnMediaEdit = value;
    }

    return this._syncOnMediaEdit;
  }.property('store'),

  siteUrl: function() {
    return this.get('store').siteUrl;
  }.property('store'),

  uploadMode: function(name, value) {
    if (this._uploadMode === undefined) {
      this._uploadMode = this.get('store').uploadMode;
    }

    if (value !== undefined) {
      this._uploadMode = value;
    }

    return this._uploadMode;
  }.property('store')

});

export default Config.create();
