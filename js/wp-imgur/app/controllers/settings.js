import Ember from 'ember';
import config from 'wp-imgur/config';

var SettingsController = Ember.ObjectController.extend({
  config: config
});

export default SettingsController;
