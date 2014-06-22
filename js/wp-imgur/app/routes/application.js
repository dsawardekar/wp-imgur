import Ember    from 'ember';
import WpNotice from 'wp-imgur/ext/wp_notice';
import Notice   from 'wp-imgur/models/notice';
import auth     from 'wp-imgur/models/auth';

var ApplicationRoute = Ember.Route.extend({
  model: function() {
    return auth.load();
  },

  afterModel: function(model) {
    WpNotice.hide();

    if (model.get('authorized')) {
      this.transitionTo('sync');
    } else {
      this.transitionTo('authorize');
    }
  },

  actions: {
    authorizeStart: function() {
      window.open(auth.get('authorizeUrl'), '_blank');
      this.get('controller').transitionToRoute('verifypin');
    },

    verifyPin: function() {
      Notice.show('progress', 'Verifying PIN ...');
      var self = this;

      auth.verifyPin()
      .then(function() {
        Notice.show('updated', 'PIN Verified successfully.');

        var controller = self.get('controller');
        controller.transitionToRoute('sync');
      })
      .catch(function(error) {
        Notice.show('error', error);
      });
    },

    error: function(reason) {
      WpNotice.show('error', 'Error: ' + reason);
    }
  }
});

export default ApplicationRoute;
