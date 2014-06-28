import Ember from 'ember';
import sync from 'wp-imgur/models/sync';

var SyncRoute = Ember.Route.extend({
  model: function() {
    return sync;
  }
});

export default SyncRoute;
