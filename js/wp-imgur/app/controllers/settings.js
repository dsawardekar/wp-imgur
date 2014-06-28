import Ember from 'ember';
import config from 'wp-imgur/config';
import auth from 'wp-imgur/models/auth';
import pages from 'wp-imgur/models/pages';
import Notice from 'wp-imgur/models/notice';
import image from 'wp-imgur/models/image';

var SettingsController = Ember.ObjectController.extend({
  config: config,
  auth: auth,
  image: image,

  albumUrl: function() {
    return 'http://imgur.com/a/' + config.get('album');
  }.property('config.album'),

  onDeleteImageStart: function() {
    Notice.show('progress', 'Deleting Images ...');
    pages.set('lockEnabled', true);
  },

  onDeleteImageProgress: function() {
  },

  onDeleteImageStop: function() {
    Notice.hide();
    pages.set('lockEnabled', false);
  },

  onDeleteImageError: function(error) {
    Notice.show('error', 'Failed to delete image: ' + error);
    pages.set('lockEnabled', false);
  },

  onDeleteImageComplete: function() {
    var siteUrl = config.get('siteUrl');
    Notice.show('success', 'Album "' + siteUrl + '" was emptied successfully.');
    pages.set('lockEnabled', false);
  },

  actions: {
    startDeleteImage: function() {
      var model  = image;
      var events = ['deleteImageStart', 'deleteImageProgress', 'deleteImageStop', 'deleteImageComplete', 'deleteImageError'];
      var self   = this;

      events.forEach(function(eventName) {
        var callbackName = 'on' + eventName.capitalize();
        var callback = self[callbackName];

        model.off(eventName, self, callback);
        model.on(eventName, self, callback);
      });

      model.start();
    },

    stopDeleteImage: function() {
      var model = image;
      model.stop();
    }
  }
});

export default SettingsController;
