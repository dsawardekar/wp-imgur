import Ember from 'ember';
import Notice from 'wp-imgur/models/notice';
import pages from 'wp-imgur/models/pages';
import I18n from '../ext/ember_i18n';

var SyncController = Ember.ObjectController.extend({
  onSyncStart: function() {
    Notice.show('progress', I18n.t('status.sync.starting') + ' ...');
    pages.set('lockEnabled', true);
  },

  onSyncProgress: function() {
    var model = this.get('content');
    Notice.show('progress', I18n.t('status.sync.synchronizing') + ' ' + model.get('current.name') + ' ...');
  },

  onSyncStop: function() {
    Notice.show('success', I18n.t('status.sync.stopped'));
    pages.set('lockEnabled', false);
  },

  onSyncError: function(error) {
    Notice.show('error', error);
    pages.set('lockEnabled', false);
  },

  onSyncComplete: function() {
    Notice.show('success', I18n.t('status.sync.completed'));
    pages.set('lockEnabled', false);
  },

  actions: {
    startSync: function() {
      var model  = this.get('content');
      var events = ['syncStart', 'syncProgress', 'syncStop', 'syncComplete', 'syncError'];
      var self   = this;

      events.forEach(function(eventName) {
        var callbackName = 'on' + eventName.capitalize();
        var callback = self[callbackName];
        model.off(eventName, self, callback);
        model.on(eventName, self, callback);
      });

      var promise = model.start();
    },

    stopSync: function() {
      var model = this.get('content');
      model.stop();
    }
  }
});

export default SyncController;
