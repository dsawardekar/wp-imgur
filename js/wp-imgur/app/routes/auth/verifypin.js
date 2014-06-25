import Ember from 'ember';
import auth from 'wp-imgur/models/auth';
import pages from 'wp-imgur/models/pages';

var VerifyPinRoute = Ember.Route.extend({
  model: function() {
    return auth;
  }
});

export default VerifyPinRoute;
