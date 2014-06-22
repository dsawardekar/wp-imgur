import Ember from 'ember';
import Notice from 'wp-imgur/models/notice';

var SyncController = Ember.ObjectController.extend({
  onSyncStart: function() {
    Notice.show('progress', 'Starting Sync ...');
  },

  onSyncProgress: function() {
    var model = this.get('content');
    Notice.show('progress', 'Synchronizing ' + model.get('name') + ' ...');

    var thumb = Ember.$('.imgur-thumb');
    thumb.css('background-image', "url(" + model.get('thumbnail') + ")");
  },

  onSyncStop: function() {
    Notice.show('success', 'Sync Stopped.');
  },

  onSyncError: function(error) {
    Notice.show('error', 'Sync Failed: ' + error);
  },

  onSyncComplete: function() {
    Notice.show('success', 'Sync Completed.');
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

      model.startSync();
    },

    stopSync: function() {
      var model = this.get('content');
      model.stopSync();
    }
  }
});

export default SyncController;
