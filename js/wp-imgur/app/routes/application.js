import Ember    from 'ember';
import WpNotice from 'wp-imgur/ext/wp_notice';
import Notice   from 'wp-imgur/models/notice';
import auth     from 'wp-imgur/models/auth';
import pages from 'wp-imgur/models/pages';

var ApplicationRoute = Ember.Route.extend({
  model: function() {
    return auth.load();
  },

  afterModel: function(model) {
    WpNotice.hide();

    if (model.get('authorized')) {
      this.transitionTo('sync');
    } else {
      pages.set('lockEnabled', true);
      this.transitionTo('auth.unauthorized');
    }
  },

  actions: {
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
