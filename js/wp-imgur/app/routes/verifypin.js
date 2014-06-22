import Ember from 'ember';
import auth from 'wp-imgur/models/auth';

var VerifyPinRoute = Ember.Route.extend({
  model: function() {
    return auth;
  }
});

export default VerifyPinRoute;
