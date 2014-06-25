import Ember from 'ember';
import config from 'wp-imgur/config';
import auth from 'wp-imgur/models/auth';

var SettingsController = Ember.ObjectController.extend({
  config: config,
  auth: auth
});

export default SettingsController;
