import Ember from 'ember';
import config from 'wp-imgur/config';

var AuthorizedController = Ember.ObjectController.extend({
  config: config
});

export default AuthorizedController;
