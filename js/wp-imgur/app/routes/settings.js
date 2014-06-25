import Ember from 'ember';
import auth from 'wp-imgur/models/auth';
import settings from 'wp-imgur/models/settings';
import notice from 'wp-imgur/models/notice';

var SettingsRoute = Ember.Route.extend({
  model: function() {
    return auth.load();
  },

  actions: {
    updateMediaOptions: function(button) {
      var promise = settings.updateMediaOptions();

      button.waitFor(promise);
      notice.showAfter(promise, 'Settings Saved.');
    }
  }
});

export default SettingsRoute;
