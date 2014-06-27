import Ember from 'ember';
import Notice from 'wp-imgur/models/notice';
import pages from 'wp-imgur/models/pages';

var SyncController = Ember.ObjectController.extend({
  onSyncStart: function() {
    Notice.show('progress', 'Starting Sync ...');
    pages.set('lockEnabled', true);
  },

  onSyncProgress: function() {
    var model = this.get('content');
    Notice.show('progress', 'Synchronizing ' + model.get('current.name') + ' ...');

  },

  onSyncStop: function() {
    Notice.show('success', 'Sync Stopped.');
    pages.set('lockEnabled', false);
  },

  onSyncError: function(error) {
    Notice.show('error', 'Sync Failed: ' + error);
    pages.set('lockEnabled', false);
  },

  onSyncComplete: function() {
    Notice.show('success', 'Sync Completed.');
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
