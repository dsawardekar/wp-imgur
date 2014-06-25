import Ember from 'ember';

var Router = Ember.Router.extend({
  location: WpImgurENV.locationType
});

Router.map(function() {
  this.resource('settings', function() {
    this.resource('auth', function() {
      this.route('unauthorized');
      this.route('verifypin');
      this.route('authorized');
    });
  });

  this.route('sync');
});

export default Router;
