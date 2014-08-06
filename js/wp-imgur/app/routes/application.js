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
    error: function(reason) {
      WpNotice.show('error', Ember.I18n.t('status.error') + ': ' + reason);
    }
  }
});

export default ApplicationRoute;
