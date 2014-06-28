import Ember from 'ember';
import auth from 'wp-imgur/models/auth';

var AuthRoute = Ember.Route.extend({
  model: function() {
    return auth.load();
  },

  afterModel: function(model) {
    if (auth.get('authorized')) {
      this.transitionTo('auth.authorized');
    } else {
      this.transitionTo('auth.unauthorized');
    }
  },

  actions: {
    openAuthorizeUrl: function() {
      window.open(auth.get('authorizeUrl'), '_blank');
      this.get('controller').transitionToRoute('auth.verifypin');
    }
  }
});

export default AuthRoute;
