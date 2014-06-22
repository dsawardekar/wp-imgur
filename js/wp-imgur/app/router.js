import Ember from 'ember';

var Router = Ember.Router.extend({
  location: WpImgurENV.locationType
});

Router.map(function() {
  this.route('authorize');
  this.route('verifypin');
  this.route('sync');
});

export default Router;
